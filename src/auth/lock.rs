use std::fs::{File, OpenOptions};
use std::os::unix::fs::OpenOptionsExt;
use std::path::Path;

use crate::config::paths::ensure_private_dir;
use crate::error::StoreError;

/// Exclusive advisory lock on `<config_dir>/auth.lock`, held until dropped.
/// Every token write (refresh, login, logout) happens under it so concurrent
/// `lt` processes never spend the same rotating refresh token twice.
///
/// Each acquisition opens its own handle: flock is per open file, so a shared
/// handle would let two threads of one process in at once.
pub struct AuthLock {
    _file: File,
}

impl AuthLock {
    pub fn acquire(config_dir: &Path) -> Result<Self, StoreError> {
        let path = config_dir.join("auth.lock");
        let fail = |e: std::io::Error| {
            StoreError::Unavailable(format!("Failed to lock {}: {e}", path.display()))
        };
        ensure_private_dir(config_dir).map_err(fail)?;
        let file = OpenOptions::new()
            .create(true)
            .truncate(false)
            .write(true)
            .mode(0o600)
            .open(&path)
            .map_err(fail)?;
        file.lock().map_err(fail)?;
        Ok(Self { _file: file })
    }
}
