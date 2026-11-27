use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::{DirBuilderExt, MetadataExt, OpenOptionsExt};
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

/// An existing directory is used as is, unless anyone can write to it: they
/// could then swap the files lt keeps there, tokens included. Group write is
/// allowed because umask 002 gives it to every directory lt did not create.
pub fn ensure_private_dir(dir: &Path) -> io::Result<()> {
    fs::DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(dir)?;
    if fs::metadata(dir)?.mode() & 0o002 != 0 {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            format!(
                "{} is writable by everyone; run `chmod o-w` on it or use another directory",
                dir.display()
            ),
        ));
    }
    Ok(())
}

/// May hold tokens, so the file must stay owner-only.
pub fn write_private_atomic(path: &Path, contents: &[u8]) -> io::Result<()> {
    let dir = path.parent().unwrap_or_else(|| Path::new("."));
    ensure_private_dir(dir)?;
    let file_name = path
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();
    let tmp = dir.join(format!(".{file_name}.{}.tmp", std::process::id()));
    // A leftover from a crashed run with the same pid; `create_new` below then
    // refuses anything that reappears there, a symlink included.
    let _ = fs::remove_file(&tmp);

    let result = (|| {
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .mode(0o600)
            .open(&tmp)?;
        if file.metadata()?.uid() != fs::metadata(dir)?.uid() {
            return Err(io::Error::new(
                io::ErrorKind::PermissionDenied,
                format!("{} belongs to another user", dir.display()),
            ));
        }
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

    #[test]
    fn a_world_writable_directory_is_refused() {
        let tmp = tempfile::tempdir().unwrap();
        let shared = tmp.path().join("shared");
        fs::create_dir(&shared).unwrap();
        fs::set_permissions(&shared, fs::Permissions::from_mode(0o777)).unwrap();

        let err = write_private_atomic(&shared.join("tokens.json"), b"{}").unwrap_err();
        assert_eq!(err.kind(), io::ErrorKind::PermissionDenied);
        assert!(!shared.join("tokens.json").exists());
    }

    #[test]
    fn an_existing_group_writable_directory_is_still_usable() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path().join("conf");
        fs::create_dir(&dir).unwrap();
        fs::set_permissions(&dir, fs::Permissions::from_mode(0o775)).unwrap();

        write_private_atomic(&dir.join("config.json"), b"{}").unwrap();
    }

    #[test]
    fn a_symlink_at_the_temporary_path_is_not_followed() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path().join("conf");
        ensure_private_dir(&dir).unwrap();
        let victim = tmp.path().join("victim");
        fs::write(&victim, b"keep").unwrap();
        let tmp_path = dir.join(format!(".tokens.json.{}.tmp", std::process::id()));
        std::os::unix::fs::symlink(&victim, &tmp_path).unwrap();

        write_private_atomic(&dir.join("tokens.json"), b"secret").unwrap();
        assert_eq!(fs::read(&victim).unwrap(), b"keep");
        assert_eq!(fs::read(dir.join("tokens.json")).unwrap(), b"secret");
    }
}
