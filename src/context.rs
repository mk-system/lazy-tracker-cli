use std::io::IsTerminal;
use std::path::{Path, PathBuf};
use std::time::Duration;

use crate::auth::lock::AuthLock;
use crate::auth::store::{self, TokenStore};
use crate::cli::GlobalArgs;
use crate::config::api_url::{self, Source};
use crate::config::legacy::{self, TokenMigration};
use crate::config::paths;
use crate::config::settings::Settings;
use crate::error::CliError;
use crate::output::Ui;

/// Process environment, read once in `main`. Nothing else reads `std::env`,
/// which keeps every module testable without mutating the environment.
pub struct Env {
    pub config_dir: Option<String>,
    pub xdg_config_home: Option<String>,
    pub home: Option<PathBuf>,
    pub api_url: Option<String>,
    pub insecure_token_file: bool,
    pub no_color: bool,
    pub cwd: PathBuf,
}

impl Env {
    pub fn from_process() -> Self {
        let var = |name: &str| std::env::var(name).ok();
        Self {
            config_dir: var("LT_CONFIG_DIR"),
            xdg_config_home: var("XDG_CONFIG_HOME"),
            home: std::env::home_dir(),
            api_url: var("LT_API_URL"),
            insecure_token_file: var("LT_INSECURE_TOKEN_FILE").as_deref() == Some("1"),
            no_color: var("NO_COLOR").is_some_and(|v| !v.is_empty()),
            cwd: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
        }
    }
}

pub struct Context {
    pub ui: Ui,
    pub api_url: Result<String, String>,
    pub api_url_source: Source,
    pub http: ureq::Agent,
    pub store: Box<dyn TokenStore>,
    pub config_dir: PathBuf,
    pub settings_path: PathBuf,
    pub settings: Settings,
    pub legacy_path: Option<PathBuf>,
    pub cwd: PathBuf,
    pub home: Option<PathBuf>,
    pub stdin_tty: bool,
}

impl Context {
    pub fn new(global: &GlobalArgs, env: Env) -> Result<Self, CliError> {
        let ui = Ui::new(
            global.verbose,
            global.no_color || env.no_color,
            std::io::stderr().is_terminal(),
        );

        if let Some(flag) = global.api_url.as_deref() {
            api_url::validate(flag).map_err(CliError::Usage)?;
        }

        let config_dir = paths::config_dir(
            env.config_dir.as_deref(),
            env.xdg_config_home.as_deref(),
            env.home.as_deref(),
        )
        .ok_or_else(|| {
            CliError::usage("Cannot locate the config directory: set HOME or LT_CONFIG_DIR.")
        })?;
        let settings_path = config_dir.join("config.json");

        // Tests point LT_CONFIG_DIR at a temp dir and must never read or
        // rewrite the developer's real legacy file.
        let legacy_path = match env.config_dir.as_deref().filter(|d| !d.is_empty()) {
            Some(_) => None,
            None => legacy::legacy_path(env.home.as_deref(), env.xdg_config_home.as_deref()),
        };

        if let Some(legacy) = &legacy_path
            && let Err(e) = legacy::migrate_settings(legacy, &settings_path)
        {
            ui.debug(&format!("legacy settings migration skipped: {e}"));
        }

        let settings = Settings::load(&settings_path).map_err(CliError::from)?;
        let (api_url_source, api_url) = api_url::resolve(
            global.api_url.as_deref(),
            settings.api_url.as_deref(),
            env.api_url.as_deref(),
        );

        let store = store::select(env.insecure_token_file, &config_dir);
        if let Some(legacy) = legacy_path.as_deref().filter(|p| legacy::has_tokens(p)) {
            migrate_legacy_tokens(&ui, legacy, store.as_ref(), &config_dir);
        }

        Ok(Self {
            ui,
            api_url,
            api_url_source,
            http: http_agent(),
            store,
            config_dir,
            settings_path,
            settings,
            legacy_path,
            cwd: env.cwd,
            home: env.home,
            stdin_tty: std::io::stdin().is_terminal(),
        })
    }

    pub fn api_url(&self) -> Result<&str, CliError> {
        self.api_url
            .as_deref()
            .map_err(|e| CliError::Usage(e.clone()))
    }

    #[cfg(test)]
    pub fn for_tests(
        api_url: &str,
        store: Box<dyn TokenStore>,
        config_dir: PathBuf,
    ) -> (Self, std::sync::Arc<std::sync::Mutex<Vec<u8>>>) {
        let (ui, log) = Ui::capturing(true);
        let ctx = Self {
            ui,
            api_url: Ok(api_url.to_owned()),
            api_url_source: Source::Flag,
            http: http_agent(),
            store,
            settings_path: config_dir.join("config.json"),
            config_dir: config_dir.clone(),
            settings: Settings::default(),
            legacy_path: None,
            cwd: config_dir,
            home: None,
            stdin_tty: false,
        };
        (ctx, log)
    }
}

/// Runs under the auth lock like every other token write, so a concurrent
/// refresh is never overwritten by the stale copy in the legacy file.
fn migrate_legacy_tokens(ui: &Ui, legacy: &Path, store: &dyn TokenStore, config_dir: &Path) {
    let _lock = match AuthLock::acquire(config_dir) {
        Ok(lock) => lock,
        Err(e) => {
            ui.debug(&format!("legacy token migration skipped: {e}"));
            return;
        }
    };
    match legacy::migrate_tokens(legacy, store) {
        Ok(TokenMigration::Deferred(e)) => {
            ui.debug(&format!("legacy token migration deferred: {e}"));
        }
        Ok(_) => {}
        Err(e) => ui.debug(&format!("legacy token migration skipped: {e}")),
    }
}

fn http_agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .http_status_as_error(false)
        .timeout_connect(Some(Duration::from_secs(10)))
        .timeout_global(Some(Duration::from_secs(30)))
        .user_agent(format!("lt/{}", env!("CARGO_PKG_VERSION")))
        .build()
        .into()
}
