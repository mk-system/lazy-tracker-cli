use serde_json::Value;

use crate::api::endpoints;
use crate::cli::TeamsArgs;
use crate::commands::with_spinner;
use crate::context::Context;
use crate::error::CliError;
use crate::output::json::{print_json, print_stdout};
use crate::output::table::{render, truncate};

pub fn run(ctx: &Context, args: &TeamsArgs) -> Result<(), CliError> {
    let teams = with_spinner(ctx, "Fetching teams...", "Failed to fetch teams", || {
        endpoints::my_teams(ctx)
    })?;
    ctx.ui
        .succeed_spinner(&format!("Found {} team(s)", teams.len()));

    if args.json {
        print_json(&Value::Array(teams));
        return Ok(());
    }
    if teams.is_empty() {
        print_stdout("No teams found.", ctx.ui.color());
        return Ok(());
    }

    let rows: Vec<Vec<String>> = teams
        .iter()
        .map(|team| {
            vec![
                truncate(&text(team, "teamKey"), 28),
                truncate(&text(team, "description"), 47),
            ]
        })
        .collect();
    print_stdout(
        &format!("\n{}", render(&["Key", "Description"], &rows, true)),
        ctx.ui.color(),
    );
    Ok(())
}

/// A display string for a JSON field: strings verbatim, `null`/missing as
/// empty, anything else in its JSON form.
pub fn text(item: &Value, key: &str) -> String {
    match item.get(key) {
        None | Some(Value::Null) => String::new(),
        Some(Value::String(s)) => s.clone(),
        Some(other) => other.to_string(),
    }
}
