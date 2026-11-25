use serde_json::{Map, Value, json};

use crate::api::endpoints::{self, TicketCreateRequest, TicketUpdateRequest};
use crate::cli::{
    TicketTarget, TicketsCommand, TicketsCreateArgs, TicketsListArgs, TicketsUpdateArgs,
};
use crate::commands::teams::text;
use crate::commands::with_spinner;
use crate::config::project_file::resolve_team_project;
use crate::context::Context;
use crate::error::CliError;
use crate::output::json::{print_json, print_stdout};
use crate::output::prompt::{confirm, ensure_can_confirm};
use crate::output::table::render;
use crate::ticket_ref::{self, is_ticket_number, scope_fields};

const DEFAULT_COLUMNS: [&str; 5] = ["ticketNumber", "title", "state", "projectKey", "teamKey"];
const CREATE_TYPES: [&str; 2] = ["normal", "release"];
const CREATE_STATES: [&str; 3] = ["unscheduled", "created", "started"];
const CREATE_LIST_TYPES: [&str; 3] = ["done", "current_backlog", "icebox"];
const UPDATE_STATES: [&str; 6] = [
    "created",
    "started",
    "finished",
    "delivered",
    "accepted",
    "rejected",
];

pub fn run(ctx: &Context, command: TicketsCommand) -> Result<(), CliError> {
    match command {
        TicketsCommand::List(args) => list(ctx, &args),
        TicketsCommand::Show(target) => show(ctx, &target),
        TicketsCommand::Create(args) => create(ctx, args),
        TicketsCommand::Update(args) => update(ctx, args),
        TicketsCommand::Delete { target, force } => delete(ctx, &target, force),
    }
}

fn list(ctx: &Context, args: &TicketsListArgs) -> Result<(), CliError> {
    let resolved = resolve_team_project(
        args.team.as_deref(),
        args.project.as_deref(),
        &ctx.cwd,
        &ctx.settings,
    );
    if resolved.is_none() && args.project.is_some() && args.team.is_none() {
        ctx.ui
            .warn("--project requires --team. Ignoring --project option.");
    }

    let (tickets, scope) = with_spinner(
        ctx,
        "Fetching tickets...",
        "Failed to fetch tickets",
        || {
            let mut scope = Map::new();
            let tickets = match (&resolved, args.team.as_deref()) {
                (Some(tp), _) => {
                    scope = scope_fields(Some(tp));
                    endpoints::project_tickets(ctx, &tp.team, &tp.project)?
                }
                (None, Some(team)) => {
                    scope.insert("team".into(), Value::String(team.to_owned()));
                    endpoints::team_tickets(ctx, team)?
                }
                (None, None) => endpoints::tickets(ctx)?,
            };
            Ok((tickets, scope))
        },
    )?;

    let matches = |ticket: &Value, key: &str, wanted: &Option<String>| {
        wanted
            .as_deref()
            .is_none_or(|w| ticket.get(key).and_then(Value::as_str) == Some(w))
    };
    let tickets: Vec<Value> = tickets
        .into_iter()
        .filter(|t| matches(t, "state", &args.state) && matches(t, "listType", &args.list_type))
        .collect();
    ctx.ui
        .succeed_spinner(&format!("Found {} ticket(s)", tickets.len()));

    if args.table {
        let columns: Vec<String> = match &args.columns {
            Some(cols) => cols.split(',').map(|c| c.trim().to_owned()).collect(),
            None => DEFAULT_COLUMNS.map(str::to_owned).to_vec(),
        };
        print_stdout(&ticket_table(&tickets, &columns), ctx.ui.color());
        return Ok(());
    }

    let mut output = scope;
    output.insert("count".into(), json!(tickets.len()));
    output.insert("tickets".into(), Value::Array(tickets));
    print_json(&Value::Object(output));
    Ok(())
}

fn column_label(column: &str) -> &str {
    match column {
        "id" => "ID",
        "ticketNumber" => "#",
        "title" => "Title",
        "state" => "State",
        "listType" => "List Type",
        "point" => "Points",
        "projectKey" => "Project",
        "teamKey" => "Team",
        "ticketType" => "Type",
        other => other,
    }
}

fn column_value(ticket: &Value, column: &str) -> String {
    match column {
        "title" => {
            let title = text(ticket, "title");
            if title.chars().count() > 50 {
                format!("{}...", title.chars().take(47).collect::<String>())
            } else {
                title
            }
        }
        "point" => match ticket.get("point") {
            None | Some(Value::Null) => "-".to_owned(),
            Some(_) => text(ticket, "point"),
        },
        "id" | "ticketNumber" | "state" | "listType" | "projectKey" | "teamKey" | "ticketType" => {
            text(ticket, column)
        }
        _ => "-".to_owned(),
    }
}

fn ticket_table(tickets: &[Value], columns: &[String]) -> String {
    if tickets.is_empty() {
        return "No tickets found.".to_owned();
    }
    let headers: Vec<&str> = columns.iter().map(|c| column_label(c)).collect();
    let rows: Vec<Vec<String>> = tickets
        .iter()
        .map(|t| columns.iter().map(|c| column_value(t, c)).collect())
        .collect();
    render(&headers, &rows, false)
}

fn show(ctx: &Context, target: &TicketTarget) -> Result<(), CliError> {
    let (ticket, scope) =
        with_spinner(ctx, "Fetching ticket...", "Failed to fetch ticket", || {
            ticket_ref::fetch_ticket(
                ctx,
                &target.ticket,
                target.team.as_deref(),
                target.project.as_deref(),
            )
        })?;
    ctx.ui.succeed_spinner("Ticket loaded");

    let mut output = scope_fields(scope.as_ref());
    output.insert("ticket".into(), ticket);
    print_json(&Value::Object(output));
    Ok(())
}

fn one_of(value: &str, allowed: &[&str], what: &str) -> Result<(), CliError> {
    if allowed.contains(&value) {
        return Ok(());
    }
    Err(CliError::usage(format!(
        "{what}: {value}. Must be one of: {}",
        allowed.join(", ")
    )))
}

fn parse_point(raw: &str) -> Option<i32> {
    if raw.is_empty() || !raw.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    raw.parse().ok()
}

fn is_release_date(raw: &str) -> bool {
    let bytes = raw.as_bytes();
    bytes.len() == 10
        && bytes.iter().enumerate().all(|(i, b)| match i {
            4 | 7 => *b == b'-',
            _ => b.is_ascii_digit(),
        })
}

fn create(ctx: &Context, args: TicketsCreateArgs) -> Result<(), CliError> {
    let scope = resolve_team_project(
        args.team.as_deref(),
        args.project.as_deref(),
        &ctx.cwd,
        &ctx.settings,
    )
    .ok_or_else(|| {
        CliError::usage(
            "Team and project are required. Create .lazy-tracker.json or specify --team and --project options.",
        )
    })?;

    let ticket = with_spinner(ctx, "Creating ticket...", "Failed to create ticket", || {
        one_of(&args.ticket_type, &CREATE_TYPES, "Invalid ticket type")?;
        one_of(&args.state, &CREATE_STATES, "Invalid initial state")?;
        one_of(&args.list_type, &CREATE_LIST_TYPES, "Invalid list type")?;

        let point = match args.point.as_deref().filter(|p| !p.is_empty()) {
            Some(raw) => Some(
                parse_point(raw)
                    .ok_or_else(|| CliError::usage("Points must be a non-negative integer"))?,
            ),
            None => None,
        };
        let release_date = match args.release_date.as_deref().filter(|d| !d.is_empty()) {
            Some(date) if is_release_date(date) => Some(date.to_owned()),
            Some(_) => {
                return Err(CliError::usage("Release date must be in YYYY-MM-DD format"));
            }
            None => None,
        };

        let request = TicketCreateRequest {
            title: args.title.clone(),
            description: args.description.clone().unwrap_or_default(),
            ticket_type: args.ticket_type.clone(),
            state: args.state.clone(),
            list_type: args.list_type.clone(),
            assignee_ids: Vec::new(),
            tag_ids: Vec::new(),
            point,
            release_date,
        };
        endpoints::create_ticket(ctx, &scope.team, &scope.project, &request)
    })?;
    ctx.ui.succeed_spinner("Ticket created");

    print_json(&json!({
        "team": scope.team,
        "project": scope.project,
        "ticket": ticket,
    }));
    Ok(())
}

fn build_update(args: &TicketsUpdateArgs) -> Result<Option<TicketUpdateRequest>, CliError> {
    let mut request = TicketUpdateRequest {
        title: args.title.clone(),
        description: args.description.clone(),
        ..TicketUpdateRequest::default()
    };

    if let Some(state) = &args.state {
        one_of(state, &UPDATE_STATES, "Invalid state")?;
        request.state = Some(state.clone());
    }
    if let Some(raw) = &args.point {
        request.point = Some(match raw.as_str() {
            "null" => None,
            _ => Some(parse_point(raw).ok_or_else(|| {
                CliError::usage("Points must be a non-negative integer or \"null\"")
            })?),
        });
    }
    if let Some(raw) = &args.release_date {
        request.release_date = Some(match raw.as_str() {
            "null" => None,
            date if is_release_date(date) => Some(date.to_owned()),
            _ => {
                return Err(CliError::usage(
                    "Release date must be in YYYY-MM-DD format or \"null\"",
                ));
            }
        });
    }

    let changed = request.title.is_some()
        || request.description.is_some()
        || request.state.is_some()
        || request.point.is_some()
        || request.release_date.is_some();
    Ok(changed.then_some(request))
}

/// Resolves a ticket number to its UUID with its own spinner, as the update
/// and delete commands report the lookup separately from the change itself.
fn lookup_number(ctx: &Context, target: &TicketTarget) -> Result<Value, CliError> {
    let scope = ticket_ref::resolve_scope(ctx, target.team.as_deref(), target.project.as_deref())?;
    let ticket = with_spinner(ctx, "Looking up ticket...", "Ticket not found", || {
        endpoints::ticket_by_number(ctx, &scope.team, &scope.project, &target.ticket)
    })?;
    ctx.ui
        .succeed_spinner(&format!("Found ticket #{}", target.ticket));
    Ok(ticket)
}

fn update(ctx: &Context, args: TicketsUpdateArgs) -> Result<(), CliError> {
    let request = build_update(&args)?.ok_or_else(|| {
        CliError::usage("No changes specified. Use --help to see available options.")
    })?;

    let ticket_id = if is_ticket_number(&args.target.ticket) {
        ticket_ref::ticket_id(&lookup_number(ctx, &args.target)?)?
    } else {
        args.target.ticket.clone()
    };

    let ticket = with_spinner(ctx, "Updating ticket...", "Failed to update ticket", || {
        endpoints::update_ticket(ctx, &ticket_id, &request)
    })?;
    ctx.ui.succeed_spinner("Ticket updated");

    print_json(&json!({ "ticket": ticket }));
    Ok(())
}

fn delete(ctx: &Context, target: &TicketTarget, force: bool) -> Result<(), CliError> {
    if !force {
        ensure_can_confirm(ctx.stdin_tty)?;
    }

    let (ticket_id, title) = if is_ticket_number(&target.ticket) {
        let ticket = lookup_number(ctx, target)?;
        (ticket_ref::ticket_id(&ticket)?, text(&ticket, "title"))
    } else {
        // The lookup is kept for UUIDs too: the title in the confirmation
        // prompt is what lets the user catch a wrong ID.
        let ticket = with_spinner(
            ctx,
            "Fetching ticket details...",
            "Failed to fetch ticket",
            || endpoints::ticket(ctx, &target.ticket),
        )?;
        ctx.ui.succeed_spinner("Ticket found");
        (target.ticket.clone(), text(&ticket, "title"))
    };

    if !force {
        let shown = if title.is_empty() {
            String::new()
        } else {
            format!(" \"{title}\"")
        };
        let message = format!("Are you sure you want to delete ticket{shown}?");
        if !confirm(&ctx.ui, ctx.stdin_tty, &message)? {
            ctx.ui.line("Cancelled.");
            return Ok(());
        }
    }

    with_spinner(ctx, "Deleting ticket...", "Failed to delete ticket", || {
        endpoints::delete_ticket(ctx, &ticket_id)
    })?;
    ctx.ui.succeed_spinner("Ticket deleted");

    print_json(&json!({ "deleted": true, "ticketId": ticket_id }));
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn update_args(point: Option<&str>, release_date: Option<&str>) -> TicketsUpdateArgs {
        TicketsUpdateArgs {
            target: TicketTarget {
                ticket: "1".into(),
                team: None,
                project: None,
            },
            title: None,
            description: None,
            state: None,
            point: point.map(str::to_owned),
            release_date: release_date.map(str::to_owned),
        }
    }

    #[test]
    fn points_must_be_plain_non_negative_integers() {
        assert_eq!(parse_point("3"), Some(3));
        assert_eq!(parse_point("0"), Some(0));
        assert_eq!(parse_point("3abc"), None);
        assert_eq!(parse_point("-1"), None);
        assert_eq!(parse_point("1.5"), None);
        assert_eq!(parse_point("99999999999"), None);
    }

    #[test]
    fn release_dates_must_look_like_yyyy_mm_dd() {
        assert!(is_release_date("2026-11-25"));
        assert!(!is_release_date("2026-1-25"));
        assert!(!is_release_date("2026/11/25"));
    }

    #[test]
    fn update_with_null_clears_point_and_release_date() {
        let request = build_update(&update_args(Some("null"), Some("null")))
            .unwrap()
            .unwrap();
        assert_eq!(
            serde_json::to_string(&request).unwrap(),
            r#"{"point":null,"release_date":null}"#
        );
    }

    #[test]
    fn update_without_any_change_is_rejected() {
        assert!(build_update(&update_args(None, None)).unwrap().is_none());
    }

    #[test]
    fn update_rejects_a_malformed_point() {
        assert!(build_update(&update_args(Some("3abc"), None)).is_err());
    }

    #[test]
    fn table_truncates_long_titles_and_shows_missing_points_as_a_dash() {
        let tickets = vec![json!({
            "ticketNumber": 7,
            "title": "x".repeat(60),
            "point": null,
        })];
        let columns = ["ticketNumber", "title", "point", "unknown"].map(str::to_owned);
        let table = ticket_table(&tickets, &columns);
        let row = table.lines().nth(2).unwrap();

        assert!(row.starts_with("7  "));
        assert!(row.contains(&format!("{}...", "x".repeat(47))));
        assert!(row.trim_end().ends_with("-       -"));
    }
}
