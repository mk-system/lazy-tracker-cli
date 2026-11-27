use serde_json::json;

use crate::auth::CLIENT_ID;
use crate::auth::lock::AuthLock;
use crate::auth::oauth::{self, OAuthError};
use crate::auth::token::{TokenData, TokenResponse, now_ms};
use crate::config::{api_url, legacy};
use crate::context::Context;
use crate::error::{CliError, StoreError};

pub const NOT_AUTHENTICATED: &str = "Not authenticated. Run `lt auth login` first.";
pub const SESSION_EXPIRED: &str = "Session expired. Please login again with `lt auth login`.";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Trigger {
    Expired,
    /// The API answered 401 to a token that looked valid.
    Rejected,
}

fn not_authenticated() -> CliError {
    CliError::Auth(NOT_AUTHENTICATED.to_owned())
}

/// A store that cannot be read is reported as such, never as "logged out".
pub fn credentials(ctx: &Context) -> Result<TokenData, CliError> {
    let tokens = ctx.store.load()?.ok_or_else(not_authenticated)?;
    ensure_issued_here(ctx, &tokens)?;
    if !tokens.is_expired(now_ms()) {
        return Ok(tokens);
    }
    refresh(ctx, &tokens.refresh_token, Trigger::Expired)
}

/// `stale` is the refresh token the caller saw before taking the lock.
pub fn refresh(ctx: &Context, stale: &str, trigger: Trigger) -> Result<TokenData, CliError> {
    let _lock = AuthLock::acquire(&ctx.config_dir)?;
    let current = ctx.store.load()?.ok_or_else(not_authenticated)?;
    ensure_issued_here(ctx, &current)?;
    let fresh = !current.is_expired(now_ms());

    if current.refresh_token != stale && fresh {
        ctx.ui
            .debug("session was already refreshed by another lt process");
        return Ok(current);
    }
    if current.refresh_token == stale && fresh && trigger == Trigger::Expired {
        return Ok(current);
    }
    exchange(ctx, &current.refresh_token)
}

fn exchange(ctx: &Context, refresh_token: &str) -> Result<TokenData, CliError> {
    let body = json!({
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID,
    });
    let response = oauth::post(ctx, &["token"], &body, |e| {
        format!("Failed to refresh the session: {e}. Your saved login was kept; try again.")
    })?;

    let status = response.status;
    if response.is_success() {
        let parsed: TokenResponse = serde_json::from_str(&response.body).map_err(|e| {
            CliError::Api {
                message: format!(
                    "Failed to refresh the session: unexpected response from the server ({e}). Your saved login was kept; try again."
                ),
                status,
                body: None,
            }
        })?;
        let tokens = parsed
            .into_token_data(now_ms(), Some(refresh_token), api_origin(ctx)?)
            .ok_or_else(|| CliError::Auth(SESSION_EXPIRED.to_owned()))?;
        ctx.store.save(&tokens)?;
        return Ok(tokens);
    }

    // Error bodies from the token endpoint are kept out of CliError::Api so
    // that `--verbose` never prints anything the token endpoint returned.
    let oauth_error = OAuthError::parse(&response.body).unwrap_or_default();
    if is_definitive_rejection(status, oauth_error.code()) {
        ctx.ui
            .debug("refresh token rejected: clearing stored tokens");
        clear_all(ctx);
        return Err(CliError::Auth(SESSION_EXPIRED.to_owned()));
    }

    let detail = match oauth_error
        .description()
        .or(oauth_error.code().map(str::to_owned))
    {
        Some(reason) => format!("status {status}: {reason}"),
        None => format!("status {status}"),
    };
    let message = if is_client_error(status) {
        format!(
            "Failed to refresh the session ({detail}). Run `lt auth login --force` to sign in again."
        )
    } else {
        format!(
            "Failed to refresh the session ({detail}). Your saved login was kept; try again later."
        )
    };
    Err(CliError::Api {
        message,
        status,
        body: None,
    })
}

/// Only these prove the refresh token is dead. Anything else (rate limits,
/// outages, a 400 caused by a CLI bug) keeps the tokens so the user is not
/// logged out by a transient or unrelated failure.
fn is_definitive_rejection(status: u16, error: Option<&str>) -> bool {
    status == 401 || (status == 400 && error == Some("invalid_grant"))
}

pub fn api_origin(ctx: &Context) -> Result<Option<String>, CliError> {
    Ok(api_url::origin_of(ctx.api_url()?))
}

/// Tokens are never sent to an API other than the one that issued them, so a
/// mistyped `--api-url` cannot hand the refresh token to another server. The
/// stored tokens are kept: they are still valid for their own API.
pub fn ensure_issued_here(ctx: &Context, tokens: &TokenData) -> Result<(), CliError> {
    let current = api_origin(ctx)?;
    let here = current.as_deref().unwrap_or("this API");
    match tokens.api_origin.as_deref() {
        Some(issuer) if current.as_deref() == Some(issuer) => Ok(()),
        Some(issuer) => Err(CliError::Auth(format!(
            "You are logged in to {issuer}, not {here}. Use that API URL, or run `lt auth login --force` to sign in to this one."
        ))),
        // Tokens saved before the origin was recorded (the Bun release, or
        // its Keychain item read directly) came from the default API or the
        // one configured in config.json, and are only trusted there.
        None => {
            let known = [
                Some(api_url::DEFAULT_API_URL),
                ctx.settings.api_url.as_deref(),
            ];
            if known
                .into_iter()
                .flatten()
                .filter_map(api_url::origin_of)
                .any(|o| current.as_deref() == Some(o.as_str()))
            {
                Ok(())
            } else {
                Err(CliError::Auth(format!(
                    "Your saved login does not record which API issued it, so it is not sent to {here}. Run `lt auth login --force` to sign in to this API."
                )))
            }
        }
    }
}

pub fn is_client_error(status: u16) -> bool {
    (400..500).contains(&status) && status != 429
}

/// Whether `lt auth login` should run the device flow (`true`) or report that
/// the user is already signed in (`false`).
pub fn ensure_loginable(ctx: &Context) -> Result<bool, CliError> {
    let Some(tokens) = ctx.store.load()? else {
        return Ok(true);
    };
    ensure_issued_here(ctx, &tokens)?;
    if !tokens.is_expired(now_ms()) {
        return Ok(false);
    }
    match refresh(ctx, &tokens.refresh_token, Trigger::Expired) {
        Ok(_) => Ok(false),
        Err(CliError::Auth(_)) => Ok(true),
        Err(CliError::Api { status, .. }) if is_client_error(status) => Ok(true),
        Err(e) => Err(e),
    }
}

/// Fails early when the token store cannot be read, so the user does not
/// finish a browser authorization only to lose the result.
pub fn check_store_usable(ctx: &Context) -> Result<(), CliError> {
    match ctx.store.load() {
        Err(e @ StoreError::Unavailable(_)) => Err(e.into()),
        _ => Ok(()),
    }
}

pub fn save_login(ctx: &Context, tokens: &TokenData) -> Result<(), CliError> {
    let _lock = AuthLock::acquire(&ctx.config_dir)?;
    ctx.store.save(tokens)?;
    Ok(())
}

/// Returns false when there was nothing to log out of. `before_clear` sees the
/// tokens read under the lock, so a concurrent refresh cannot hand it a pair
/// that is about to be replaced.
pub fn logout(
    ctx: &Context,
    before_clear: impl FnOnce(&TokenData) -> Result<(), CliError>,
) -> Result<bool, CliError> {
    let _lock = AuthLock::acquire(&ctx.config_dir)?;
    let Some(tokens) = ctx.store.load()? else {
        return Ok(false);
    };
    before_clear(&tokens)?;
    ctx.store.clear()?;
    clear_legacy(ctx);
    Ok(true)
}

fn clear_all(ctx: &Context) {
    if let Err(e) = ctx.store.clear() {
        ctx.ui.debug(&format!("failed to clear stored tokens: {e}"));
    }
    clear_legacy(ctx);
}

/// A plaintext copy left by the Bun release must not outlive a logout.
fn clear_legacy(ctx: &Context) {
    if let Some(path) = &ctx.legacy_path
        && let Err(e) = legacy::remove_tokens(path)
    {
        ctx.ui
            .debug(&format!("failed to remove legacy tokens: {e}"));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::store::TokenStore;
    use crate::auth::store::file::FileStore;
    use crate::auth::store::memory::MemoryStore;
    use crate::mock_server::{MockServer, Route};
    use std::path::Path;
    use std::time::Duration;

    const TOKEN_PATH: &str = "/api/v1/oauth/token";
    const REFRESH_OK: &str = r#"{"access_token":"fresh-access","refresh_token":"fresh-refresh","expires_in":3600,"scope":"read write"}"#;

    fn tokens(refresh: &str, expires_at: u64) -> TokenData {
        TokenData {
            access_token: format!("access-for-{refresh}"),
            refresh_token: refresh.into(),
            expires_at,
            refresh_token_expires_at: None,
            scope: "read write".into(),
            api_origin: None,
        }
    }

    // 2100-01-01T00:00:00Z
    const FAR_FUTURE_MS: u64 = 4_102_444_800_000;

    fn expired() -> TokenData {
        tokens("old-refresh", 1_000)
    }

    fn valid() -> TokenData {
        tokens("old-refresh", FAR_FUTURE_MS)
    }

    fn issued_by(url: &str, tokens: TokenData) -> TokenData {
        TokenData {
            api_origin: api_url::origin_of(url),
            ..tokens
        }
    }

    fn context(server: &MockServer, store: Box<dyn TokenStore>, dir: &Path) -> Context {
        Context::for_tests(&server.url(), store, dir.to_path_buf()).0
    }

    fn with_memory(
        routes: Vec<Route>,
        stored: Option<TokenData>,
    ) -> (MockServer, Context, tempfile::TempDir) {
        let server = MockServer::start(routes);
        let dir = tempfile::tempdir().unwrap();
        let store = match stored {
            Some(t) if t.api_origin.is_some() => MemoryStore::with(t),
            Some(t) => MemoryStore::with(issued_by(&server.url(), t)),
            None => MemoryStore::default(),
        };
        let ctx = context(&server, Box::new(store), dir.path());
        (server, ctx, dir)
    }

    fn without_origin(tokens: TokenData) -> TokenData {
        TokenData {
            api_origin: None,
            ..tokens
        }
    }

    /// The stored tokens, compared against fixtures that carry no origin.
    fn stored(ctx: &Context) -> Option<TokenData> {
        stored_raw(ctx).map(without_origin)
    }

    fn stored_raw(ctx: &Context) -> Option<TokenData> {
        ctx.store.load().unwrap()
    }

    #[test]
    fn an_unexpired_token_is_returned_without_any_request() {
        let (server, ctx, _dir) = with_memory(vec![], Some(valid()));
        assert_eq!(without_origin(credentials(&ctx).unwrap()), valid());
        assert!(server.requests().is_empty());
    }

    #[test]
    fn tokens_issued_by_another_api_are_neither_sent_nor_cleared() {
        let foreign = TokenData {
            api_origin: Some("https://api.lazy-tracker.com".into()),
            ..expired()
        };
        let (server, ctx, _dir) = with_memory(vec![], Some(foreign.clone()));

        let err = credentials(&ctx).unwrap_err();
        assert!(
            err.to_string()
                .contains("logged in to https://api.lazy-tracker.com")
        );
        assert!(server.requests().is_empty());
        assert_eq!(stored_raw(&ctx), Some(foreign));
    }

    #[test]
    fn tokens_without_an_origin_are_used_with_the_default_api() {
        let dir = tempfile::tempdir().unwrap();
        let (ctx, _) = Context::for_tests(
            api_url::DEFAULT_API_URL,
            Box::new(MemoryStore::with(valid())),
            dir.path().into(),
        );
        assert_eq!(credentials(&ctx).unwrap(), valid());
    }

    #[test]
    fn tokens_without_an_origin_are_used_with_the_api_url_in_config_json() {
        let server = MockServer::start(vec![]);
        let dir = tempfile::tempdir().unwrap();
        let (mut ctx, _) = Context::for_tests(
            &server.url(),
            Box::new(MemoryStore::with(valid())),
            dir.path().into(),
        );
        ctx.settings.api_url = Some(server.url());
        assert_eq!(credentials(&ctx).unwrap(), valid());
    }

    #[test]
    fn tokens_without_an_origin_are_not_sent_to_any_other_api() {
        let server = MockServer::start(vec![]);
        let dir = tempfile::tempdir().unwrap();
        let (ctx, _) = Context::for_tests(
            &server.url(),
            Box::new(MemoryStore::with(expired())),
            dir.path().into(),
        );

        let err = credentials(&ctx).unwrap_err();
        assert!(
            err.to_string()
                .contains("does not record which API issued it")
        );
        assert!(server.requests().is_empty());
        assert_eq!(stored(&ctx), Some(expired()));
    }

    #[test]
    fn a_refresh_records_the_api_that_issued_the_tokens() {
        let (server, ctx, _dir) = with_memory(
            vec![Route::new("POST", TOKEN_PATH).json(REFRESH_OK)],
            Some(expired()),
        );
        credentials(&ctx).unwrap();

        let origin = api_url::origin_of(&server.url());
        assert_eq!(stored_raw(&ctx).unwrap().api_origin, origin);
        assert!(credentials(&ctx).is_ok());
    }

    #[test]
    fn an_expired_token_is_refreshed_and_the_result_saved() {
        let (server, ctx, _dir) = with_memory(
            vec![Route::new("POST", TOKEN_PATH).json(REFRESH_OK)],
            Some(expired()),
        );
        let refreshed = credentials(&ctx).unwrap();

        assert_eq!(refreshed.access_token, "fresh-access");
        assert_eq!(stored(&ctx).unwrap().refresh_token, "fresh-refresh");
        let body: serde_json::Value = serde_json::from_str(&server.requests()[0].body).unwrap();
        assert_eq!(body["grant_type"], "refresh_token");
        assert_eq!(body["refresh_token"], "old-refresh");
        assert_eq!(body["client_id"], "lazy-tracker-cli");
    }

    #[test]
    fn transient_refresh_failures_keep_the_stored_tokens() {
        for status in [500, 503, 429] {
            let (_server, ctx, _dir) = with_memory(
                vec![Route::new("POST", TOKEN_PATH).status(status).json("{}")],
                Some(expired()),
            );
            let err = credentials(&ctx).unwrap_err();

            assert!(matches!(err, CliError::Api { .. }), "status {status}");
            assert_eq!(stored(&ctx), Some(expired()), "status {status}");
        }
    }

    #[test]
    fn an_unreachable_server_keeps_the_stored_tokens() {
        let dir = tempfile::tempdir().unwrap();
        let unused = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let url = format!("http://{}", unused.local_addr().unwrap());
        drop(unused);
        let (ctx, _) = Context::for_tests(
            &url,
            Box::new(MemoryStore::with(issued_by(&url, expired()))),
            dir.path().into(),
        );

        assert!(matches!(
            credentials(&ctx).unwrap_err(),
            CliError::Network { .. }
        ));
        assert_eq!(stored(&ctx), Some(expired()));
    }

    #[test]
    fn only_401_or_invalid_grant_discards_the_stored_tokens() {
        let rejections = [
            (401, r#"{"error":"invalid_client"}"#),
            (
                400,
                r#"{"error":"invalid_grant","error_description":"Invalid refresh token"}"#,
            ),
        ];
        for (status, body) in rejections {
            let (_server, ctx, _dir) = with_memory(
                vec![Route::new("POST", TOKEN_PATH).status(status).json(body)],
                Some(expired()),
            );
            let err = credentials(&ctx).unwrap_err();

            assert_eq!(err.to_string(), SESSION_EXPIRED);
            assert_eq!(stored(&ctx), None, "status {status}");
        }
    }

    #[test]
    fn other_client_errors_keep_the_tokens_and_point_to_a_forced_login() {
        let (_server, ctx, _dir) = with_memory(
            vec![
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"VALIDATION_ERROR"}"#),
            ],
            Some(expired()),
        );
        let err = credentials(&ctx).unwrap_err();

        assert!(err.to_string().contains("lt auth login --force"));
        assert_eq!(stored(&ctx), Some(expired()));
    }

    #[test]
    fn a_refresh_done_by_another_process_is_reused_without_a_request() {
        let (server, ctx, _dir) = with_memory(vec![], Some(tokens("rotated", FAR_FUTURE_MS)));
        let result = refresh(&ctx, "old-refresh", Trigger::Rejected).unwrap();

        assert_eq!(result.refresh_token, "rotated");
        assert!(server.requests().is_empty());
    }

    #[test]
    fn an_unreadable_store_is_a_store_error_and_nothing_is_cleared() {
        let (server, ctx, _dir) = with_memory(vec![], None);
        let ctx = Context {
            store: Box::new(MemoryStore::unavailable()),
            ..ctx
        };
        let err = credentials(&ctx).unwrap_err();

        assert!(matches!(err, CliError::Store(StoreError::Unavailable(_))));
        assert!(server.requests().is_empty());
    }

    #[test]
    fn no_stored_tokens_means_not_authenticated() {
        let (_server, ctx, _dir) = with_memory(vec![], None);
        assert_eq!(
            credentials(&ctx).unwrap_err().to_string(),
            NOT_AUTHENTICATED
        );
    }

    #[test]
    fn two_threads_seeing_an_expired_token_trigger_a_single_refresh() {
        let server = MockServer::start(vec![
            Route::new("POST", TOKEN_PATH)
                .json(REFRESH_OK)
                .delay(Duration::from_millis(300)),
        ]);
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("tokens.json");
        FileStore::new(path.clone())
            .save(&issued_by(&server.url(), expired()))
            .unwrap();

        let handles: Vec<_> = (0..2)
            .map(|_| {
                let url = server.url();
                let dir = dir.path().to_path_buf();
                let path = path.clone();
                std::thread::spawn(move || {
                    let (ctx, _) = Context::for_tests(&url, Box::new(FileStore::new(path)), dir);
                    credentials(&ctx).map(|t| t.access_token)
                })
            })
            .collect();
        for handle in handles {
            assert_eq!(handle.join().unwrap().unwrap(), "fresh-access");
        }
        assert_eq!(server.count("POST", TOKEN_PATH), 1);
    }

    #[test]
    fn login_is_skipped_while_the_session_is_valid() {
        let (_server, ctx, _dir) = with_memory(vec![], Some(valid()));
        assert!(!ensure_loginable(&ctx).unwrap());
    }

    #[test]
    fn login_proceeds_when_the_refresh_token_is_rejected() {
        let (_server, ctx, _dir) = with_memory(
            vec![
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"invalid_grant"}"#),
            ],
            Some(expired()),
        );
        assert!(ensure_loginable(&ctx).unwrap());
    }

    #[test]
    fn login_stops_on_a_transient_refresh_failure() {
        let (_server, ctx, _dir) = with_memory(
            vec![Route::new("POST", TOKEN_PATH).status(503)],
            Some(expired()),
        );
        assert!(ensure_loginable(&ctx).is_err());
        assert_eq!(stored(&ctx), Some(expired()));
    }

    fn with_legacy_tokens(ctx: Context, dir: &Path) -> (Context, std::path::PathBuf) {
        let legacy = dir.join("legacy-config.json");
        std::fs::write(
            &legacy,
            r#"{"config":{},"tokens":{"accessToken":"a","refreshToken":"r","expiresAt":1,"scope":""}}"#,
        )
        .unwrap();
        let ctx = Context {
            legacy_path: Some(legacy.clone()),
            ..ctx
        };
        (ctx, legacy)
    }

    #[test]
    fn logout_also_removes_plaintext_tokens_left_by_the_bun_release() {
        let (_server, ctx, dir) = with_memory(vec![], Some(valid()));
        let (ctx, legacy) = with_legacy_tokens(ctx, dir.path());
        logout(&ctx, |_| Ok(())).unwrap();

        assert!(!crate::config::legacy::has_tokens(&legacy));
        assert!(std::fs::read_to_string(&legacy).unwrap().contains("config"));
    }

    #[test]
    fn a_rejected_refresh_token_also_removes_legacy_plaintext_tokens() {
        let (_server, ctx, dir) = with_memory(
            vec![
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"invalid_grant"}"#),
            ],
            Some(expired()),
        );
        let (ctx, legacy) = with_legacy_tokens(ctx, dir.path());
        let _ = credentials(&ctx);

        assert!(!crate::config::legacy::has_tokens(&legacy));
    }

    #[test]
    fn logout_hands_the_tokens_read_under_the_lock_to_the_revoke_step() {
        let (_server, ctx, _dir) = with_memory(vec![], Some(valid()));
        let mut seen = None;
        assert!(
            logout(&ctx, |t| {
                seen = Some(t.clone());
                Ok(())
            })
            .unwrap()
        );
        assert_eq!(seen.map(without_origin), Some(valid()));
    }

    #[test]
    fn logout_without_tokens_reports_nothing_to_do() {
        let (_server, ctx, _dir) = with_memory(vec![], None);
        let mut called = false;
        assert!(
            !logout(&ctx, |_| {
                called = true;
                Ok(())
            })
            .unwrap()
        );
        assert!(!called);
    }

    #[test]
    fn logout_clears_the_store() {
        let (_server, ctx, _dir) = with_memory(vec![], Some(valid()));
        logout(&ctx, |_| Ok(())).unwrap();
        assert_eq!(stored(&ctx), None);
    }
}
