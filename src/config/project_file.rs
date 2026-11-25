use std::fs;
use std::path::Path;

use serde_json::Value;

use crate::config::settings::Settings;

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
fn read_project_file(path: &Path) -> Option<PartialProject> {
    let content = fs::read_to_string(path).ok()?;
    let parsed: Value = serde_json::from_str(&content).ok()?;
    let field = |key: &str| parsed.get(key).and_then(Value::as_str).map(str::to_owned);
    let found = PartialProject {
        team: field("team"),
        project: field("project"),
    };
    (found.team.is_some() || found.project.is_some()).then_some(found)
}

pub fn find_project_file(start: &Path) -> Option<PartialProject> {
    start
        .ancestors()
        .find_map(|dir| read_project_file(&dir.join(PROJECT_FILE_NAME)))
}

/// CLI option > `.lazy-tracker.json` > global settings, merged per field.
pub fn resolve_team_project(
    team: Option<&str>,
    project: Option<&str>,
    cwd: &Path,
    settings: &Settings,
) -> Option<TeamProject> {
    let file = find_project_file(cwd).unwrap_or_default();
    let pick = |cli: Option<&str>, file: Option<&String>, global: Option<&String>| {
        [cli, file.map(String::as_str), global.map(String::as_str)]
            .into_iter()
            .flatten()
            .find(|v| !v.is_empty())
            .map(str::to_owned)
    };
    let team = pick(team, file.team.as_ref(), settings.default_team.as_ref())?;
    let project = pick(
        project,
        file.project.as_ref(),
        settings.default_project.as_ref(),
    )?;
    Some(TeamProject { team, project })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write(dir: &Path, content: &str) {
        fs::write(dir.join(PROJECT_FILE_NAME), content).unwrap();
    }

    #[test]
    fn the_nearest_ancestor_file_is_used() {
        let root = tempfile::tempdir().unwrap();
        let nested = root.path().join("a/b");
        fs::create_dir_all(&nested).unwrap();
        write(root.path(), r#"{"team":"root-team","project":"root-proj"}"#);
        write(&root.path().join("a"), r#"{"team":"a-team"}"#);

        let found = find_project_file(&nested).unwrap();
        assert_eq!(found.team.as_deref(), Some("a-team"));
        assert_eq!(found.project, None);
    }

    #[test]
    fn a_broken_file_is_skipped_in_favour_of_an_ancestor() {
        let root = tempfile::tempdir().unwrap();
        let child = root.path().join("child");
        fs::create_dir_all(&child).unwrap();
        write(root.path(), r#"{"team":"t","project":"p"}"#);
        write(&child, "{not json");

        let found = find_project_file(&child).unwrap();
        assert_eq!(found.team.as_deref(), Some("t"));
    }

    #[test]
    fn the_api_url_in_a_project_file_is_ignored() {
        let root = tempfile::tempdir().unwrap();
        write(root.path(), r#"{"apiUrl":"https://evil.example"}"#);
        assert_eq!(find_project_file(root.path()), None);
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

        let resolved = resolve_team_project(None, None, root.path(), &settings).unwrap();
        assert_eq!(resolved.team, "global-team");
        assert_eq!(resolved.project, "file-proj");

        let resolved =
            resolve_team_project(Some("cli-team"), None, root.path(), &settings).unwrap();
        assert_eq!(resolved.team, "cli-team");
    }

    #[test]
    fn resolution_fails_when_either_field_is_missing() {
        let root = tempfile::tempdir().unwrap();
        let resolved = resolve_team_project(Some("team"), None, root.path(), &Settings::default());
        assert_eq!(resolved, None);
    }
}
