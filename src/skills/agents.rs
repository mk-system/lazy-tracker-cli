use std::path::{Path, PathBuf};

use clap::ValueEnum;

use crate::cli::Agent;
use crate::error::CliError;
use crate::skills::SKILL_DIR_NAME;
use crate::skills::git_root::{find_git_root, normalize};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Scope {
    User,
    Project,
    Custom(String),
}

pub const ALL: [Agent; 4] = [
    Agent::ClaudeCode,
    Agent::Codex,
    Agent::Copilot,
    Agent::Cursor,
];

pub fn name(agent: Agent) -> String {
    agent
        .to_possible_value()
        .map(|v| v.get_name().to_owned())
        .unwrap_or_default()
}

pub fn names() -> String {
    ALL.iter().map(|a| name(*a)).collect::<Vec<_>>().join(", ")
}

pub fn skills_dir(agent: Agent) -> &'static str {
    match agent {
        Agent::ClaudeCode => ".claude/skills",
        Agent::Codex | Agent::Copilot | Agent::Cursor => ".agents/skills",
    }
}

pub fn user_install_dir(agent: Agent, home: Option<&Path>) -> Result<PathBuf, CliError> {
    let home = home.ok_or_else(|| CliError::usage("Cannot locate the home directory"))?;
    Ok(home.join(skills_dir(agent)).join(SKILL_DIR_NAME))
}

pub fn project_install_dir(agent: Agent, cwd: &Path) -> Option<PathBuf> {
    find_git_root(cwd).map(|root| root.join(skills_dir(agent)).join(SKILL_DIR_NAME))
}

pub fn install_dir(
    agent: Agent,
    scope: &Scope,
    cwd: &Path,
    home: Option<&Path>,
) -> Result<PathBuf, CliError> {
    match scope {
        Scope::Custom(dir) => Ok(normalize(&cwd.join(dir)).join(SKILL_DIR_NAME)),
        Scope::Project => project_install_dir(agent, cwd).ok_or_else(|| {
            CliError::usage(
                "Git repository not found. Use --dir to specify a custom path, or run from within a git repository.",
            )
        }),
        Scope::User => user_install_dir(agent, home),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn agent_names_match_the_cli_values() {
        assert_eq!(names(), "claude-code, codex, copilot, cursor");
    }

    #[test]
    fn claude_code_uses_its_own_directory_and_the_rest_share_agents() {
        assert_eq!(skills_dir(Agent::ClaudeCode), ".claude/skills");
        assert_eq!(skills_dir(Agent::Cursor), ".agents/skills");
    }

    #[test]
    fn a_custom_dir_is_resolved_against_the_working_directory() {
        let dir = install_dir(
            Agent::Codex,
            &Scope::Custom("../out".into()),
            Path::new("/work/repo"),
            None,
        )
        .unwrap();
        assert_eq!(dir, PathBuf::from("/work/out/lazy-tracker-cli"));
    }
}
