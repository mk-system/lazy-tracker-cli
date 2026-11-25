mod auth;
mod comments;
mod config;
mod projects;
mod skills;
mod teams;
mod tickets;

use crate::cli::Command;
use crate::context::Context;
use crate::error::CliError;

pub fn run(ctx: &Context, command: Command) -> Result<(), CliError> {
    match command {
        Command::Auth { command } => auth::run(ctx, command),
        Command::Teams(args) => teams::run(ctx, &args),
        Command::Projects(args) => projects::run(ctx, &args),
        Command::Tickets { command } => tickets::run(ctx, command),
        Command::Comments { command } => comments::run(ctx, command),
        Command::Skills { command } => skills::run(ctx, command),
        Command::Config => config::show(ctx),
        Command::ConfigSet { key, value } => config::set(ctx, &key, &value),
    }
}

/// Runs `f` with a spinner, reporting `failure` before the error propagates.
fn with_spinner<T>(
    ctx: &Context,
    start: &str,
    failure: &str,
    f: impl FnOnce() -> Result<T, CliError>,
) -> Result<T, CliError> {
    ctx.ui.start_spinner(start);
    f().inspect_err(|_| ctx.ui.fail_spinner(failure))
}
