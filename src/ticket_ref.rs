//! Ticket numbers are unique only within a project, while several endpoints
//! (chats, update, delete) accept the ticket UUID alone. Numbers are turned
//! into tickets via team/project; anything else is taken as a UUID.

use serde_json::{Map, Value};

use crate::api::endpoints;
use crate::config::project_file::{TeamProject, resolve_team_project};
use crate::context::Context;
use crate::error::CliError;

pub const TEAM_PROJECT_REQUIRED: &str = "Team and project are required for ticket number lookup. Create .lazy-tracker.json or specify --team and --project options.";

pub fn is_ticket_number(input: &str) -> bool {
    !input.is_empty() && input.bytes().all(|b| b.is_ascii_digit())
}

pub fn resolve_scope(
    ctx: &Context,
    team: Option<&str>,
    project: Option<&str>,
) -> Result<TeamProject, CliError> {
    resolve_team_project(team, project, &ctx.cwd, &ctx.settings)
        .ok_or_else(|| CliError::usage(TEAM_PROJECT_REQUIRED))
}

/// The `team` / `project` keys that prefix JSON output when a number was
/// resolved; empty for UUID lookups.
pub fn scope_fields(scope: Option<&TeamProject>) -> Map<String, Value> {
    let mut fields = Map::new();
    if let Some(scope) = scope {
        fields.insert("team".into(), Value::String(scope.team.clone()));
        fields.insert("project".into(), Value::String(scope.project.clone()));
    }
    fields
}

pub fn fetch_ticket(
    ctx: &Context,
    input: &str,
    team: Option<&str>,
    project: Option<&str>,
) -> Result<(Value, Option<TeamProject>), CliError> {
    if !is_ticket_number(input) {
        return Ok((endpoints::ticket(ctx, input)?, None));
    }
    let scope = resolve_scope(ctx, team, project)?;
    let ticket = endpoints::ticket_by_number(ctx, &scope.team, &scope.project, input)?;
    Ok((ticket, Some(scope)))
}

pub fn ticket_id(ticket: &Value) -> Result<String, CliError> {
    ticket
        .get("id")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .ok_or_else(|| CliError::usage("The server returned a ticket without an id"))
}

pub fn resolve_ticket_id(
    ctx: &Context,
    input: &str,
    team: Option<&str>,
    project: Option<&str>,
) -> Result<(String, Option<TeamProject>), CliError> {
    if !is_ticket_number(input) {
        return Ok((input.to_owned(), None));
    }
    let (ticket, scope) = fetch_ticket(ctx, input, team, project)?;
    Ok((ticket_id(&ticket)?, scope))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_ascii_digits_are_ticket_numbers() {
        assert!(is_ticket_number("42"));
        assert!(!is_ticket_number(""));
        assert!(!is_ticket_number("4a"));
        assert!(!is_ticket_number("0f8fad5b-d9cb-469f-a165-70867728950e"));
        assert!(!is_ticket_number("４２"));
    }

    #[test]
    fn scope_fields_come_first_as_team_then_project() {
        let scope = TeamProject {
            team: "t".into(),
            project: "p".into(),
        };
        let keys: Vec<_> = scope_fields(Some(&scope)).keys().cloned().collect();
        assert_eq!(keys, ["team", "project"]);
        assert!(scope_fields(None).is_empty());
    }
}
