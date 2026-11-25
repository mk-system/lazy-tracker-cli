use std::fs;
use std::path::{Component, Path, PathBuf};

/// Lexically resolves `.` and `..` like Node's `path.resolve`, without
/// touching the filesystem.
pub fn normalize(path: &Path) -> PathBuf {
    let mut out = PathBuf::new();
    for component in path.components() {
        match component {
            Component::ParentDir => {
                out.pop();
            }
            Component::CurDir => {}
            other => out.push(other),
        }
    }
    out
}

/// Finds the repository root that owns `start`. A `.git` file is followed
/// only for the two layouts git itself writes (worktrees and submodules): an
/// arbitrary `gitdir:` pointer could otherwise steer skill installs and
/// removals to a directory outside the repository.
pub fn find_git_root(start: &Path) -> Option<PathBuf> {
    start.ancestors().find_map(git_root_at)
}

fn git_root_at(dir: &Path) -> Option<PathBuf> {
    let git_path = dir.join(".git");
    let meta = fs::metadata(&git_path).ok()?;
    if meta.is_dir() {
        return Some(dir.to_path_buf());
    }
    if !meta.is_file() {
        return None;
    }
    let content = fs::read_to_string(&git_path).ok()?;
    let target = content.trim().strip_prefix("gitdir:")?.trim();
    let gitdir = normalize(&dir.join(target));
    let container = gitdir.parent()?.file_name()?;

    if container == "worktrees" {
        let real_git_dir = normalize(&gitdir.join("../.."));
        return real_git_dir
            .is_dir()
            .then(|| real_git_dir.parent().map(Path::to_path_buf))
            .flatten();
    }
    if container == "modules" {
        // A submodule's own directory is its root; following gitdir would
        // climb into the superproject.
        return gitdir.is_dir().then(|| dir.to_path_buf());
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp() -> (tempfile::TempDir, PathBuf) {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path().canonicalize().unwrap();
        (dir, root)
    }

    #[test]
    fn a_git_directory_marks_the_root_from_any_subdirectory() {
        let (_guard, root) = tmp();
        fs::create_dir_all(root.join("repo/.git")).unwrap();
        fs::create_dir_all(root.join("repo/src/deep")).unwrap();

        assert_eq!(
            find_git_root(&root.join("repo/src/deep")),
            Some(root.join("repo"))
        );
    }

    #[test]
    fn a_worktree_resolves_to_the_main_repository_root() {
        let (_guard, root) = tmp();
        fs::create_dir_all(root.join("main/.git/worktrees/feature")).unwrap();
        fs::create_dir_all(root.join("feature")).unwrap();
        fs::write(
            root.join("feature/.git"),
            format!(
                "gitdir: {}\n",
                root.join("main/.git/worktrees/feature").display()
            ),
        )
        .unwrap();

        assert_eq!(
            find_git_root(&root.join("feature")),
            Some(root.join("main"))
        );
    }

    #[test]
    fn a_submodule_is_its_own_root() {
        let (_guard, root) = tmp();
        fs::create_dir_all(root.join("super/.git/modules/lib")).unwrap();
        fs::create_dir_all(root.join("super/lib")).unwrap();
        fs::write(root.join("super/lib/.git"), "gitdir: ../.git/modules/lib\n").unwrap();

        assert_eq!(
            find_git_root(&root.join("super/lib")),
            Some(root.join("super/lib"))
        );
    }

    #[test]
    fn an_unrecognized_gitdir_pointer_is_not_followed() {
        let (_guard, root) = tmp();
        fs::create_dir_all(root.join("elsewhere/target")).unwrap();
        fs::create_dir_all(root.join("outer/.git")).unwrap();
        fs::create_dir_all(root.join("outer/inner")).unwrap();
        fs::write(
            root.join("outer/inner/.git"),
            format!("gitdir: {}\n", root.join("elsewhere/target").display()),
        )
        .unwrap();

        assert_eq!(
            find_git_root(&root.join("outer/inner")),
            Some(root.join("outer"))
        );
    }

    #[test]
    fn a_worktree_pointer_to_a_missing_repository_is_not_followed() {
        let (_guard, root) = tmp();
        fs::create_dir_all(root.join("wt")).unwrap();
        fs::write(
            root.join("wt/.git"),
            format!(
                "gitdir: {}\n",
                root.join("gone/.git/worktrees/wt").display()
            ),
        )
        .unwrap();

        assert_eq!(find_git_root(&root.join("wt")), None);
    }

    #[test]
    fn no_repository_means_no_root() {
        let (_guard, root) = tmp();
        assert_eq!(find_git_root(&root), None);
    }
}
