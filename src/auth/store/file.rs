use std::fs;
use std::io::{self, Read};
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use crate::auth::store::{TokenStore, parse_stored, serialize};
use crate::auth::token::TokenData;
use crate::config::paths::write_private_atomic;
use crate::error::StoreError;

pub struct FileStore {
    path: PathBuf,
}

impl FileStore {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }

    /// A file others can write, or one that does not belong to the owner of
    /// its directory, may have been swapped for someone else's tokens.
    fn ensure_private(&self, file: &fs::File) -> Result<(), StoreError> {
        let meta = file.metadata().map_err(|e| self.unavailable("read", e))?;
        let dir = self.path.parent().unwrap_or_else(|| Path::new("."));
        let dir_owner = fs::metadata(dir)
            .map_err(|e| self.unavailable("read", e))?
            .uid();
        if meta.mode() & 0o077 != 0 || meta.uid() != dir_owner {
            return Err(StoreError::Unavailable(format!(
                "Refusing to read {}: it must be owned by you and not accessible to others (chmod 600).",
                self.path.display()
            )));
        }
        Ok(())
    }

    fn unavailable(&self, action: &str, err: io::Error) -> StoreError {
        StoreError::Unavailable(format!("Failed to {action} {}: {err}", self.path.display()))
    }
}

impl TokenStore for FileStore {
    fn load(&self) -> Result<Option<TokenData>, StoreError> {
        let mut file = match fs::File::open(&self.path) {
            Ok(file) => file,
            Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(self.unavailable("read", e)),
        };
        self.ensure_private(&file)?;
        let mut raw = String::new();
        file.read_to_string(&mut raw)
            .map_err(|e| self.unavailable("read", e))?;
        parse_stored(&raw).map(Some)
    }

    fn save(&self, tokens: &TokenData) -> Result<(), StoreError> {
        write_private_atomic(&self.path, serialize(tokens).as_bytes())
            .map_err(|e| self.unavailable("write", e))
    }

    fn clear(&self) -> Result<(), StoreError> {
        match fs::remove_file(&self.path) {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
            Err(e) => Err(self.unavailable("remove", e)),
        }
    }

    fn describe(&self) -> &str {
        "plaintext file (LT_INSECURE_TOKEN_FILE)"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::os::unix::fs::PermissionsExt;

    fn tokens() -> TokenData {
        TokenData {
            access_token: "access".into(),
            refresh_token: "refresh".into(),
            expires_at: 1,
            refresh_token_expires_at: None,
            scope: "read write".into(),
            api_origin: None,
        }
    }

    #[test]
    fn saved_tokens_are_owner_only_and_load_back() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("tokens.json");
        let store = FileStore::new(path.clone());
        store.save(&tokens()).unwrap();

        assert_eq!(
            fs::metadata(&path).unwrap().permissions().mode() & 0o777,
            0o600
        );
        assert_eq!(store.load().unwrap(), Some(tokens()));
    }

    #[test]
    fn a_token_file_others_can_read_or_write_is_refused() {
        use std::os::unix::fs::PermissionsExt;
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("tokens.json");
        let store = FileStore::new(path.clone());
        store.save(&tokens()).unwrap();
        fs::set_permissions(&path, fs::Permissions::from_mode(0o664)).unwrap();

        assert!(matches!(store.load(), Err(StoreError::Unavailable(_))));
    }

    #[test]
    fn a_missing_file_means_not_logged_in() {
        let tmp = tempfile::tempdir().unwrap();
        let store = FileStore::new(tmp.path().join("tokens.json"));
        assert_eq!(store.load().unwrap(), None);
        store.clear().unwrap();
    }

    #[test]
    fn broken_json_is_reported_as_corrupt_and_left_in_place() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("tokens.json");
        fs::write(&path, "{oops").unwrap();
        fs::set_permissions(&path, std::os::unix::fs::PermissionsExt::from_mode(0o600)).unwrap();
        let store = FileStore::new(path.clone());

        assert!(matches!(store.load(), Err(StoreError::Corrupt(_))));
        assert!(path.exists());
    }

    #[test]
    fn an_unreadable_path_is_an_error_not_a_logout() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("tokens.json");
        fs::create_dir(&path).unwrap();
        let store = FileStore::new(path);

        assert!(matches!(store.load(), Err(StoreError::Unavailable(_))));
    }
}
