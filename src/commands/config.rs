use crate::config::api_url::{self, Source};
use crate::config::settings::Settings;
use crate::context::Context;
use crate::error::CliError;
use crate::output::json::print_stdout;
use crate::output::style;

pub fn show(ctx: &Context) -> Result<(), CliError> {
    let api_url = match (&ctx.api_url, ctx.api_url_source) {
        (Ok(url), Source::Flag | Source::Settings) => url.clone(),
        (Ok(url), Source::Env | Source::Default) => format!("{url} {}", style::dim("(default)")),
        (Err(e), _) => format!("{} {}", style::red("invalid"), style::dim(e)),
    };
    let or_unset =
        |value: &Option<String>| value.clone().unwrap_or_else(|| style::dim("(not set)"));
    let text = [
        String::new(),
        style::bold("Current Configuration"),
        String::new(),
        format!("  API URL: {api_url}"),
        format!("  Default Team: {}", or_unset(&ctx.settings.default_team)),
        format!(
            "  Default Project: {}",
            or_unset(&ctx.settings.default_project)
        ),
    ]
    .join("\n");
    print_stdout(&text, ctx.ui.color());
    Ok(())
}

const KEYS: [&str; 3] = ["api-url", "default-team", "default-project"];

pub fn set(ctx: &Context, key: &str, value: &str) -> Result<(), CliError> {
    // Re-read from disk so a `--api-url` override can never be persisted.
    let mut settings = Settings::load(&ctx.settings_path)?;
    match key {
        "api-url" => {
            let url = api_url::validate(value).map_err(CliError::Usage)?;
            settings.api_url = Some(url);
        }
        "default-team" => settings.default_team = Some(value.to_owned()),
        "default-project" => settings.default_project = Some(value.to_owned()),
        _ => {
            return Err(CliError::usage(format!(
                "Unknown configuration key: {key}\nValid keys: {}",
                KEYS.join(", ")
            )));
        }
    }
    settings.save(&ctx.settings_path)?;
    ctx.ui.success(&format!("Set {key} to {value}"));
    Ok(())
}
