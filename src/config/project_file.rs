use std::fs;
use std::io;
use std::path::Path;

use serde_json::Value;

use crate::config::settings::Settings;
use crate::error::CliError;

pub const PROJECT_FILE_NAME: &str = ".lazy-tracker.json";

#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct PartialProject {
    pub team: Option<String>,
    pub project: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TeamProject {
    pub team: String,
    pub project: String,
}

/// Only `team` and `project` are read. The API URL is deliberately ignored so
/// a committed file cannot redirect where the bearer token is sent.
fn read_project_file(path: &Path) -> Result<Option<PartialProject>, CliError> {
    let broken = |reason: String| {
        CliError::usage(format!(
            "Cannot use {}: {reason}. Fix or remove the file.",
            path.display()
        ))
    };
    let content = match fs::read_to_string(path) {
        Ok(content) => content,
        Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(None),
        Err(e) => return Err(broken(e.to_string())),
    };
    let parsed: Value = serde_json::from_str(&content).map_err(|e| broken(e.to_string()))?;
    let field = |key: &str| parsed.get(key).and_then(Value::as_str).map(str::to_owned);
    let found = PartialProject {
        team: field("team"),
        project: field("project"),
    };
    Ok((found.team.is_some() || found.project.is_some()).then_some(found))
}

pub struct ProjectFileSearch<'a> {
    pub cwd: &'a Path,
    pub home: Option<&'a Path>,
    /// `LT_PROJECT_FILE`: a file outside the repository (e.g. one shared by
    /// several repositories) is only read when named explicitly.
    pub explicit: Option<&'a Path>,
}

/// Walks up to the git root, or HOME outside a repository. A file in a parent
/// of the repository is never picked up implicitly, because anyone who can
/// write there (a shared `/tmp`, an enclosing checkout) would otherwise choose
/// the project that updates and deletes act on.
pub fn find_project_file(search: &ProjectFileSearch) -> Result<Option<PartialProject>, CliError> {
    if let Some(path) = search.explicit {
        return match read_project_file(path)? {
            Some(found) => Ok(Some(found)),
            None if path.exists() => Ok(None),
            None => Err(CliError::usage(format!(
                "LT_PROJECT_FILE points to a missing file: {}",
                path.display()
            ))),
        };
    }
    let boundary = search
        .cwd
        .ancestors()
        .find(|dir| dir.join(".git").exists() || Some(*dir) == search.home)
        .unwrap_or(search.cwd);
    for dir in search.cwd.ancestors() {
        if let Some(found) = read_project_file(&dir.join(PROJECT_FILE_NAME))? {
            return Ok(Some(found));
        }
        if dir == boundary {
            break;
        }
    }
    Ok(None)
}

pub fn resolve_team_project(
    team: Option<&str>,
    project: Option<&str>,
    search: &ProjectFileSearch,
    settings: &Settings,
) -> Result<Option<TeamProject>, CliError> {
    let file = find_project_file(search)?.unwrap_or_default();
    let pick = |cli: Option<&str>, file: Option<&String>, global: Option<&String>| {
        [cli, file.map(String::as_str), global.map(String::as_str)]
            .into_iter()
            .flatten()
            .find(|v| !v.is_empty())
            .map(str::to_owned)
    };
    let team = pick(team, file.team.as_ref(), settings.default_team.as_ref());
    let project = pick(
        project,
        file.project.as_ref(),
        settings.default_project.as_ref(),
    );
    Ok(team
        .zip(project)
        .map(|(team, project)| TeamProject { team, project }))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write(dir: &Path, content: &str) {
        fs::write(dir.join(PROJECT_FILE_NAME), content).unwrap();
    }

    fn search(cwd: &Path) -> ProjectFileSearch<'_> {
        ProjectFileSearch {
            cwd,
            home: None,
            explicit: None,
        }
    }

    fn repo(root: &Path) -> std::path::PathBuf {
        let repo = root.join("repo");
        fs::create_dir_all(repo.join(".git")).unwrap();
        repo
    }

    #[test]
    fn the_nearest_ancestor_file_inside_the_repository_is_used() {
        let root = tempfile::tempdir().unwrap();
        let repo = repo(root.path());
        let nested = repo.join("a/b");
        fs::create_dir_all(&nested).unwrap();
        write(&repo, r#"{"team":"root-team","project":"root-proj"}"#);
        write(&repo.join("a"), r#"{"team":"a-team"}"#);

        let found = find_project_file(&search(&nested)).unwrap().unwrap();
        assert_eq!(found.team.as_deref(), Some("a-team"));
        assert_eq!(found.project, None);
    }

    #[test]
    fn a_file_above_the_git_root_is_not_picked_up() {
        let root = tempfile::tempdir().unwrap();
        let repo = repo(root.path());
        write(root.path(), r#"{"team":"outer","project":"outer"}"#);

        assert_eq!(find_project_file(&search(&repo)).unwrap(), None);
    }

    #[test]
    fn outside_a_repository_the_search_stops_at_home() {
        let root = tempfile::tempdir().unwrap();
        let home = root.path().join("home");
        let work = home.join("work");
        fs::create_dir_all(&work).unwrap();
        write(root.path(), r#"{"team":"above-home","project":"p"}"#);
        write(&home, r#"{"team":"home","project":"p"}"#);

        let search = ProjectFileSearch {
            cwd: &work,
            home: Some(&home),
            explicit: None,
        };
        let found = find_project_file(&search).unwrap().unwrap();
        assert_eq!(found.team.as_deref(), Some("home"));
    }

    #[test]
    fn outside_a_repository_and_home_only_the_current_directory_is_read() {
        let root = tempfile::tempdir().unwrap();
        let cwd = root.path().join("tmp/work");
        fs::create_dir_all(&cwd).unwrap();
        write(
            &root.path().join("tmp"),
            r#"{"team":"planted","project":"p"}"#,
        );

        assert_eq!(find_project_file(&search(&cwd)).unwrap(), None);
    }

    #[test]
    fn an_explicit_file_outside_the_repository_is_used() {
        let root = tempfile::tempdir().unwrap();
        let repo = repo(root.path());
        write(root.path(), r#"{"team":"shared","project":"mono"}"#);
        let explicit = root.path().join(PROJECT_FILE_NAME);

        let search = ProjectFileSearch {
            cwd: &repo,
            home: None,
            explicit: Some(&explicit),
        };
        let found = find_project_file(&search).unwrap().unwrap();
        assert_eq!(found.project.as_deref(), Some("mono"));
    }

    #[test]
    fn an_explicit_file_that_does_not_exist_is_an_error() {
        let root = tempfile::tempdir().unwrap();
        let missing = root.path().join("nope.json");
        let search = ProjectFileSearch {
            cwd: root.path(),
            home: None,
            explicit: Some(&missing),
        };
        assert!(matches!(
            find_project_file(&search),
            Err(CliError::Usage(_))
        ));
    }

    #[test]
    fn a_broken_file_is_an_error_naming_the_file() {
        let root = tempfile::tempdir().unwrap();
        let repo = repo(root.path());
        write(&repo, "{not json");

        let err = find_project_file(&search(&repo)).unwrap_err();
        let message = err.to_string();
        assert!(message.contains(PROJECT_FILE_NAME));
        assert!(message.contains("Fix or remove the file"));
    }

    #[test]
    fn the_api_url_in_a_project_file_is_ignored() {
        let root = tempfile::tempdir().unwrap();
        write(root.path(), r#"{"apiUrl":"https://evil.example"}"#);
        assert_eq!(find_project_file(&search(root.path())).unwrap(), None);
    }

    #[test]
    fn fields_merge_with_cli_over_file_over_settings() {
        let root = tempfile::tempdir().unwrap();
        write(root.path(), r#"{"project":"file-proj"}"#);
        let settings = Settings {
            default_team: Some("global-team".into()),
            default_project: Some("global-proj".into()),
            ..Settings::default()
        };

        let resolved = resolve_team_project(None, None, &search(root.path()), &settings)
            .unwrap()
            .unwrap();
        assert_eq!(resolved.team, "global-team");
        assert_eq!(resolved.project, "file-proj");

        let resolved =
            resolve_team_project(Some("cli-team"), None, &search(root.path()), &settings)
                .unwrap()
                .unwrap();
        assert_eq!(resolved.team, "cli-team");
    }

    #[test]
    fn resolution_fails_when_either_field_is_missing() {
        let root = tempfile::tempdir().unwrap();
        let resolved = resolve_team_project(
            Some("team"),
            None,
            &search(root.path()),
            &Settings::default(),
        );
        assert_eq!(resolved.unwrap(), None);
    }
}
