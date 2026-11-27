use std::thread;

use serde_json::json;

use crate::auth::token::{TokenData, now_ms};
use crate::auth::{device_flow, oauth, session};
use crate::cli::AuthCommand;
use crate::config::api_url::{self, Source};
use crate::context::Context;
use crate::error::{CliError, StoreError};
use crate::output::json::print_stdout;
use crate::output::style;

pub fn run(ctx: &Context, command: AuthCommand) -> Result<(), CliError> {
    match command {
        AuthCommand::Login { force } => login(ctx, force),
        AuthCommand::Logout { revoke } => logout(ctx, revoke),
        AuthCommand::Status => status(ctx),
    }
}

fn login(ctx: &Context, force: bool) -> Result<(), CliError> {
    if force {
        session::check_store_usable(ctx)?;
    } else {
        let loginable = session::ensure_loginable(ctx).inspect_err(|e| {
            if !matches!(e, CliError::Store(StoreError::Unavailable(_))) {
                ctx.ui
                    .info("Run `lt auth login --force` to sign in again regardless.");
            }
        })?;
        if !loginable {
            ctx.ui
                .info("Already authenticated. Use --force to re-login.");
            return Ok(());
        }
    }

    let ui = &ctx.ui;
    ui.line("");
    ui.line(&style::bold("Logging in to Lazy Tracker..."));
    ui.line("");

    let result = (|| {
        let code = device_flow::request_device_code(ctx)?;
        let api = ctx.api_url()?;
        let checked = |uri: &str| {
            api_url::safe_url_to_open(uri, api).ok_or_else(|| {
                CliError::Auth(format!(
                    "The server returned an unexpected verification URL: {}",
                    style::strip_controls(uri)
                ))
            })
        };
        let shown = checked(&code.verification_uri)?;
        let target = match &code.verification_uri_complete {
            Some(complete) => checked(complete)?,
            None => shown.clone(),
        };
        ui.line("Your device code is:");
        ui.line("");
        ui.line(&format!(
            "  {}",
            style::bold_cyan(&style::strip_controls(&code.user_code))
        ));
        ui.line("");
        if ctx.no_browser {
            ui.line(&format!("Visit: {shown}"));
            ui.line("");
        } else {
            ui.line("Opening browser to authorize...");
            ui.line(&style::dim(&format!(
                "If the browser doesn't open, visit: {shown}"
            )));
            ui.line("");
            if let Err(e) = device_flow::open_browser(&target, api) {
                ui.warn(&format!(
                    "Could not open a browser ({e}). Visit the URL above."
                ));
            }
        }

        ui.start_spinner("Waiting for authorization...");
        let tokens = device_flow::poll_for_token(ctx, &code, &mut thread::sleep)?;
        session::save_login(ctx, &tokens)
    })();

    match result {
        Ok(()) => {
            ui.succeed_spinner("Authorization successful!");
            ui.line("");
            ui.success("You are now logged in to Lazy Tracker.");
            Ok(())
        }
        Err(e) => {
            ui.fail_spinner("Authorization failed");
            Err(e)
        }
    }
}

fn logout(ctx: &Context, revoke: bool) -> Result<(), CliError> {
    let mut revoked = true;
    let logged_in = session::logout(ctx, |tokens| {
        if !revoke {
            return Ok(());
        }
        session::ensure_issued_here(ctx, tokens)?;
        ctx.ui.start_spinner("Revoking token...");
        // Only the access token is sent: the backend revokes the refresh token
        // paired with it in the same call (`OAuthService.revokeToken`).
        let body = json!({ "token": tokens.access_token, "token_type_hint": "access_token" });
        match oauth::post(ctx, &["revoke"], &body, |e| e.to_string()) {
            Ok(response) if response.is_success() => ctx.ui.succeed_spinner("Token revoked"),
            _ => {
                revoked = false;
                ctx.ui
                    .fail_spinner("Failed to revoke token (clearing local credentials anyway)");
            }
        }
        Ok(())
    })?;

    if !logged_in {
        ctx.ui.info("Not currently logged in.");
        return Ok(());
    }
    ctx.ui.success("Logged out successfully.");
    if revoked {
        Ok(())
    } else {
        Err(CliError::Auth(
            "The token may still be valid on the server. Sign in again and retry `lt auth logout --revoke`."
                .into(),
        ))
    }
}

fn status(ctx: &Context) -> Result<(), CliError> {
    let tokens = ctx.store.load()?;
    let mut lines = vec![
        String::new(),
        style::bold("Authentication Status"),
        String::new(),
    ];

    let Some(tokens) = tokens else {
        lines.push(format!("{} Not authenticated", style::red("✗")));
        lines.push(String::new());
        lines.push(format!(
            "{} Run `lt auth login` to authenticate.",
            style::blue("i")
        ));
        print_stdout(&lines.join("\n"), ctx.ui.color());
        return Ok(());
    };

    let now = now_ms();
    lines.push(status_line(&tokens, now));
    lines.push(String::new());
    lines.push(format!(
        "  Access token expires: {}",
        describe_instant(tokens.expires_at, now)
    ));
    if let Some(at) = tokens.refresh_token_expires_at {
        lines.push(format!(
            "  Refresh token expires: {}",
            describe_instant(at, now)
        ));
    }
    lines.push(format!(
        "  Scopes: {}",
        style::strip_controls(&tokens.scope)
    ));
    if let (Ok(url), Source::Flag | Source::Settings) = (&ctx.api_url, ctx.api_url_source) {
        lines.push(format!("  API URL: {url}"));
    }
    lines.push(String::new());
    lines.push(style::dim(&format!(
        "Token storage: {}",
        ctx.store.describe()
    )));
    lines.push(style::dim(&format!(
        "Config stored at: {}",
        ctx.settings_path.display()
    )));
    print_stdout(&lines.join("\n"), ctx.ui.color());
    Ok(())
}

fn status_line(tokens: &TokenData, now: u64) -> String {
    if tokens.is_refresh_expired(now) {
        format!(
            "{} Session expired. Run `lt auth login` to re-authenticate.",
            style::red("✗")
        )
    } else if tokens.is_expired(now) {
        format!(
            "{} Token expired (will refresh on next request)",
            style::yellow("!")
        )
    } else {
        format!("{} Authenticated", style::green("✓"))
    }
}

/// `2026-11-26T04:05:00Z (in 11h 59m)`: UTC so the output does not depend on
/// the locale, with the distance from now for a quick read.
fn describe_instant(at_ms: u64, now_ms: u64) -> String {
    format!("{} ({})", rfc3339(at_ms), relative(at_ms, now_ms))
}

fn rfc3339(epoch_ms: u64) -> String {
    let secs = epoch_ms / 1000;
    let (days, rem) = (secs / 86_400, secs % 86_400);
    let (year, month, day) = civil_from_days(days as i64);
    format!(
        "{year:04}-{month:02}-{day:02}T{:02}:{:02}:{:02}Z",
        rem / 3600,
        rem % 3600 / 60,
        rem % 60
    )
}

/// Days since 1970-01-01 to a proleptic Gregorian date (Howard Hinnant's
/// `civil_from_days`).
fn civil_from_days(days: i64) -> (i64, u32, u32) {
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let month = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    let year = yoe + era * 400 + i64::from(month <= 2);
    (year, month, day)
}

fn relative(at_ms: u64, now_ms: u64) -> String {
    let future = at_ms >= now_ms;
    let minutes = at_ms.abs_diff(now_ms) / 60_000;
    let span = match (minutes / 1440, minutes % 1440 / 60, minutes % 60) {
        (0, 0, 0) => return "less than a minute".to_owned(),
        (0, 0, m) => format!("{m}m"),
        (0, h, m) => format!("{h}h {m}m"),
        (d, h, _) => format!("{d}d {h}h"),
    };
    if future {
        format!("in {span}")
    } else {
        format!("{span} ago")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn instants_are_shown_as_utc_rfc3339() {
        assert_eq!(rfc3339(0), "1970-01-01T00:00:00Z");
        assert_eq!(rfc3339(1_795_665_900_000), "2026-11-26T04:05:00Z");
        assert_eq!(rfc3339(951_782_400_000), "2000-02-29T00:00:00Z");
    }

    #[test]
    fn distance_from_now_is_rounded_down_to_minutes() {
        let now = 1_000_000_000_000;
        assert_eq!(relative(now + 719 * 60_000 + 59_000, now), "in 11h 59m");
        assert_eq!(relative(now - 5 * 60_000, now), "5m ago");
        assert_eq!(
            relative(now + 3 * 86_400_000 + 2 * 3_600_000, now),
            "in 3d 2h"
        );
        assert_eq!(relative(now + 30_000, now), "less than a minute");
    }
}
