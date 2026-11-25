#[cfg(not(any(target_os = "macos", target_os = "linux")))]
compile_error!("lt supports macOS and Linux only");

mod api;
mod auth;
mod cli;
mod commands;
mod config;
mod context;
mod error;
mod log;
mod output;
mod skills;
mod ticket_ref;

#[cfg(test)]
#[path = "../tests/support/server.rs"]
mod mock_server;

use std::process::ExitCode;

use clap::Parser;

use crate::cli::Cli;
use crate::context::{Context, Env};
use crate::error::format_error;
use crate::output::Ui;

fn main() -> ExitCode {
    let cli = Cli::parse();
    let env = Env::from_process();
    let no_color = cli.global.no_color || env.no_color;
    let ctx = match Context::new(&cli.global, env) {
        Ok(ctx) => ctx,
        Err(err) => {
            let ui = Ui::new(
                cli.global.verbose,
                no_color,
                std::io::IsTerminal::is_terminal(&std::io::stderr()),
            );
            ui.line(&format_error(&err, cli.global.verbose));
            return ExitCode::FAILURE;
        }
    };

    match commands::run(&ctx, cli.command) {
        Ok(()) => ExitCode::SUCCESS,
        Err(err) => {
            ctx.ui.stop_spinner();
            ctx.ui.line(&format_error(&err, ctx.ui.verbose()));
            ExitCode::FAILURE
        }
    }
}
