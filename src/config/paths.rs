use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::{Path, PathBuf};

pub const APP_DIR_NAME: &str = "lazy-tracker-cli";

/// Uses the XDG layout on macOS too, not `~/Library/Application Support`.
pub fn config_dir(
    override_dir: Option<&str>,
    xdg_config_home: Option<&str>,
    home: Option<&Path>,
) -> Option<PathBuf> {
    if let Some(dir) = non_empty(override_dir) {
        return Some(PathBuf::from(dir));
    }
    xdg_base(xdg_config_home, home).map(|base| base.join(APP_DIR_NAME))
}

pub fn xdg_base(xdg_config_home: Option<&str>, home: Option<&Path>) -> Option<PathBuf> {
    match non_empty(xdg_config_home) {
        Some(xdg) => Some(PathBuf::from(xdg)),
        None => home.map(|h| h.join(".config")),
    }
}

fn non_empty(value: Option<&str>) -> Option<&str> {
    value.filter(|v| !v.is_empty())
}

pub fn ensure_private_dir(dir: &Path) -> io::Result<()> {
    fs::DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(dir)
}

/// Replaces `path` atomically so a crash or a concurrent reader never sees a
/// half-written file. The file is created 0600 because it may hold tokens.
pub fn write_private_atomic(path: &Path, contents: &[u8]) -> io::Result<()> {
    let dir = path.parent().unwrap_or_else(|| Path::new("."));
    ensure_private_dir(dir)?;
    let file_name = path
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();
    let tmp = dir.join(format!(".{file_name}.{}.tmp", std::process::id()));

    let result = (|| {
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .mode(0o600)
            .open(&tmp)?;
        file.write_all(contents)?;
        file.sync_all()?;
        fs::rename(&tmp, path)
    })();
    if result.is_err() {
        let _ = fs::remove_file(&tmp);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::os::unix::fs::PermissionsExt;

    #[test]
    fn override_wins_over_xdg_and_home() {
        let dir = config_dir(Some("/tmp/lt"), Some("/xdg"), Some(Path::new("/home/u")));
        assert_eq!(dir, Some(PathBuf::from("/tmp/lt")));
    }

    #[test]
    fn xdg_config_home_wins_over_home() {
        let dir = config_dir(None, Some("/xdg"), Some(Path::new("/home/u")));
        assert_eq!(dir, Some(PathBuf::from("/xdg/lazy-tracker-cli")));
    }

    #[test]
    fn falls_back_to_dot_config_under_home_when_xdg_is_unset_or_empty() {
        let dir = config_dir(Some(""), Some(""), Some(Path::new("/home/u")));
        assert_eq!(dir, Some(PathBuf::from("/home/u/.config/lazy-tracker-cli")));
    }

    #[test]
    fn atomic_write_creates_an_owner_only_file_in_an_owner_only_directory() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nested").join("tokens.json");
        write_private_atomic(&path, b"{}").unwrap();

        let file_mode = fs::metadata(&path).unwrap().permissions().mode() & 0o777;
        let dir_mode = fs::metadata(path.parent().unwrap())
            .unwrap()
            .permissions()
            .mode()
            & 0o777;
        assert_eq!(file_mode, 0o600);
        assert_eq!(dir_mode, 0o700);
        assert_eq!(fs::read(&path).unwrap(), b"{}");
    }
}
