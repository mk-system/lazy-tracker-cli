//! Migration from the Bun release, which kept settings (and, outside macOS,
//! tokens) in a `conf` file: `{ "config": {...}, "tokens"?: {...} }`.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use serde_json::{Map, Value};

use crate::auth::store::TokenStore;
use crate::auth::token::TokenData;
use crate::config::paths::{self, write_private_atomic};
use crate::config::settings::Settings;
use crate::error::StoreError;

const LEGACY_DIR_NAME: &str = "lazy-tracker-cli-nodejs";

pub fn legacy_path(home: Option<&Path>, xdg_config_home: Option<&str>) -> Option<PathBuf> {
    let base = if cfg!(target_os = "macos") {
        home.map(|h| h.join("Library/Preferences"))
    } else {
        paths::xdg_base(xdg_config_home, home)
    };
    base.map(|b| b.join(LEGACY_DIR_NAME).join("config.json"))
}

fn read(path: &Path) -> io::Result<Option<Map<String, Value>>> {
    match fs::read_to_string(path) {
        Ok(raw) => match serde_json::from_str::<Value>(&raw) {
            Ok(Value::Object(map)) => Ok(Some(map)),
            _ => Ok(None),
        },
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e),
    }
}

pub fn migrate_settings(legacy: &Path, settings_path: &Path) -> io::Result<bool> {
    if settings_path.exists() {
        return Ok(false);
    }
    let Some(file) = read(legacy)? else {
        return Ok(false);
    };
    let Some(config) = file.get("config") else {
        return Ok(false);
    };
    let field = |key: &str| config.get(key).and_then(Value::as_str).map(str::to_owned);
    let settings = Settings {
        api_url: field("apiUrl"),
        default_team: field("defaultTeam"),
        default_project: field("defaultProject"),
    };
    settings.save(settings_path)?;
    Ok(true)
}

#[derive(Debug)]
pub enum TokenMigration {
    Nothing,
    Moved,
    /// The store already had credentials, or the legacy tokens could not be
    /// parsed; the plaintext copy was dropped.
    DroppedDuplicate,
    Deferred(StoreError),
}

pub fn has_tokens(legacy: &Path) -> bool {
    matches!(read(legacy), Ok(Some(file)) if file.contains_key("tokens"))
}

pub fn migrate_tokens(legacy: &Path, store: &dyn TokenStore) -> io::Result<TokenMigration> {
    let Some(file) = read(legacy)? else {
        return Ok(TokenMigration::Nothing);
    };
    let Some(raw_tokens) = file.get("tokens") else {
        return Ok(TokenMigration::Nothing);
    };
    let Ok(tokens) = serde_json::from_value::<TokenData>(raw_tokens.clone()) else {
        remove_tokens(legacy)?;
        return Ok(TokenMigration::DroppedDuplicate);
    };

    match store.load() {
        Ok(None) => match store.save(&tokens) {
            Ok(()) => {
                remove_tokens(legacy)?;
                Ok(TokenMigration::Moved)
            }
            Err(e) => Ok(TokenMigration::Deferred(e)),
        },
        Ok(Some(_)) => {
            remove_tokens(legacy)?;
            Ok(TokenMigration::DroppedDuplicate)
        }
        Err(e) => Ok(TokenMigration::Deferred(e)),
    }
}

pub fn remove_tokens(legacy: &Path) -> io::Result<()> {
    let Some(mut file) = read(legacy)? else {
        return Ok(());
    };
    if file.remove("tokens").is_none() {
        return Ok(());
    }
    let mut json = serde_json::to_vec_pretty(&Value::Object(file)).map_err(io::Error::other)?;
    json.push(b'\n');
    write_private_atomic(legacy, &json)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::store::memory::MemoryStore;

    const LEGACY: &str = r#"{
  "config": { "apiUrl": "https://old.example", "defaultTeam": "core" },
  "tokens": { "accessToken": "a", "refreshToken": "r", "expiresAt": 1, "scope": "read write" },
  "__internal__": { "migrations": { "version": "0.1.4" } }
}"#;

    fn setup() -> (tempfile::TempDir, PathBuf) {
        let tmp = tempfile::tempdir().unwrap();
        let legacy = tmp.path().join("legacy/config.json");
        fs::create_dir_all(legacy.parent().unwrap()).unwrap();
        fs::write(&legacy, LEGACY).unwrap();
        (tmp, legacy)
    }

    fn legacy_json(path: &Path) -> Map<String, Value> {
        read(path).unwrap().unwrap()
    }

    fn other_tokens() -> TokenData {
        TokenData {
            access_token: "newer".into(),
            refresh_token: "newer-r".into(),
            expires_at: 2,
            refresh_token_expires_at: None,
            scope: "read write".into(),
        }
    }

    #[test]
    fn legacy_config_section_becomes_the_new_settings_file() {
        let (tmp, legacy) = setup();
        let settings_path = tmp.path().join("new/config.json");

        assert!(migrate_settings(&legacy, &settings_path).unwrap());
        let settings = Settings::load(&settings_path).unwrap();
        assert_eq!(settings.api_url.as_deref(), Some("https://old.example"));
        assert_eq!(settings.default_team.as_deref(), Some("core"));
    }

    #[test]
    fn an_existing_settings_file_is_not_overwritten() {
        let (tmp, legacy) = setup();
        let settings_path = tmp.path().join("config.json");
        fs::write(&settings_path, "{}").unwrap();

        assert!(!migrate_settings(&legacy, &settings_path).unwrap());
        assert_eq!(fs::read_to_string(&settings_path).unwrap(), "{}");
    }

    #[test]
    fn legacy_tokens_move_into_an_empty_store_and_leave_the_file() {
        let (_tmp, legacy) = setup();
        let store = MemoryStore::default();

        let outcome = migrate_tokens(&legacy, &store).unwrap();
        assert!(matches!(outcome, TokenMigration::Moved));
        assert_eq!(store.current().unwrap().access_token, "a");
        let remaining = legacy_json(&legacy);
        assert!(!remaining.contains_key("tokens"));
        assert!(remaining.contains_key("config"));
        assert!(remaining.contains_key("__internal__"));
    }

    #[test]
    fn existing_store_credentials_win_and_the_plaintext_copy_is_dropped() {
        let (_tmp, legacy) = setup();
        let store = MemoryStore::with(other_tokens());

        let outcome = migrate_tokens(&legacy, &store).unwrap();
        assert!(matches!(outcome, TokenMigration::DroppedDuplicate));
        assert_eq!(store.current(), Some(other_tokens()));
        assert!(!legacy_json(&legacy).contains_key("tokens"));
    }

    #[test]
    fn an_unavailable_store_leaves_the_legacy_file_untouched() {
        let (_tmp, legacy) = setup();
        let before = fs::read_to_string(&legacy).unwrap();

        let outcome = migrate_tokens(&legacy, &MemoryStore::unavailable()).unwrap();
        assert!(matches!(outcome, TokenMigration::Deferred(_)));
        assert_eq!(fs::read_to_string(&legacy).unwrap(), before);
    }

    #[test]
    fn removing_tokens_keeps_the_rest_of_the_legacy_file() {
        let (_tmp, legacy) = setup();
        remove_tokens(&legacy).unwrap();

        let remaining = legacy_json(&legacy);
        assert!(!remaining.contains_key("tokens"));
        assert!(remaining.contains_key("config"));
    }

    #[test]
    fn nothing_happens_without_a_legacy_file() {
        let tmp = tempfile::tempdir().unwrap();
        let missing = tmp.path().join("absent.json");
        assert!(matches!(
            migrate_tokens(&missing, &MemoryStore::default()).unwrap(),
            TokenMigration::Nothing
        ));
        remove_tokens(&missing).unwrap();
        assert!(!missing.exists());
    }
}
