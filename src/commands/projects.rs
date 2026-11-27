use serde_json::Value;

use crate::api::endpoints;
use crate::cli::ProjectsArgs;
use crate::commands::teams::text;
use crate::commands::with_spinner;
use crate::context::Context;
use crate::error::CliError;
use crate::output::json::{print_json, print_stdout};
use crate::output::table::{Header, render, truncate};

pub fn run(ctx: &Context, args: &ProjectsArgs) -> Result<(), CliError> {
    let projects = with_spinner(
        ctx,
        "Fetching projects...",
        "Failed to fetch projects",
        || match (args.recent, args.team.as_deref()) {
            (true, _) => endpoints::recent_projects(ctx),
            (false, Some(team)) => endpoints::team_projects(ctx, team),
            (false, None) => endpoints::projects(ctx),
        },
    )?;
    ctx.ui
        .succeed_spinner(&format!("Found {} project(s)", projects.len()));

    if args.json {
        print_json(&Value::Array(projects));
        return Ok(());
    }
    if projects.is_empty() {
        print_stdout("No projects found.", ctx.ui.color());
        return Ok(());
    }

    let rows: Vec<Vec<String>> = projects
        .iter()
        .map(|project| {
            vec![
                truncate(&text(project, "teamKey"), 23),
                truncate(&text(project, "projectKey"), 23),
                truncate(&text(project, "description"), 32),
                truncate(&text(project, "weeklyVelocity"), 8),
            ]
        })
        .collect();
    print_stdout(
        &format!(
            "\n{}",
            render(
                &["Team", "Project", "Description", "Velocity"],
                &rows,
                Header::Bold
            )
        ),
        ctx.ui.color(),
    );
    Ok(())
}
