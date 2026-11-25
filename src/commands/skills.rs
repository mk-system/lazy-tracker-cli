use std::fs;
use std::io;
use std::path::Path;

use crate::cli::{Agent, SkillsCommand, SkillsTargetArgs};
use crate::context::Context;
use crate::error::CliError;
use crate::output::json::print_stdout;
use crate::output::prompt::{ask, confirm};
use crate::skills::agents::{self, ALL, Scope};
use crate::skills::{SKILL_CONTENT, SKILL_FILE_NAME};

pub fn run(ctx: &Context, command: Option<SkillsCommand>) -> Result<(), CliError> {
    match command {
        None => {
            print_stdout(SKILL_CONTENT, ctx.ui.color());
            Ok(())
        }
        Some(SkillsCommand::Install(args)) => install(ctx, &args),
        Some(SkillsCommand::Uninstall { target, force }) => uninstall(ctx, &target, force),
    }
}

fn resolve_agent(ctx: &Context, agent: Option<Agent>) -> Result<Agent, CliError> {
    if let Some(agent) = agent {
        return Ok(agent);
    }
    if !ctx.stdin_tty {
        return Err(CliError::usage(format!(
            "--agent is required in non-interactive mode. Valid agents: {}",
            agents::names()
        )));
    }
    let choices = ALL
        .iter()
        .enumerate()
        .map(|(i, a)| format!("{}:{}", i + 1, agents::name(*a)))
        .collect::<Vec<_>>()
        .join(", ");
    let answer = ask(&ctx.ui, &format!("? Select agent [{choices}]: "))?
        .ok_or_else(|| CliError::usage("Input stream closed"))?;
    answer
        .parse::<usize>()
        .ok()
        .and_then(|n| n.checked_sub(1))
        .and_then(|i| ALL.get(i).copied())
        .or_else(|| ALL.iter().copied().find(|a| agents::name(*a) == answer))
        .ok_or_else(|| CliError::usage(format!("Invalid selection: {answer}")))
}

fn resolve_scope(ctx: &Context, agent: Agent, args: &SkillsTargetArgs) -> Result<Scope, CliError> {
    match (&args.dir, args.project) {
        (Some(_), true) => Err(CliError::usage(
            "--project and --dir cannot be used together",
        )),
        (Some(dir), false) => Ok(Scope::Custom(dir.clone())),
        (None, true) => Ok(Scope::Project),
        (None, false) if args.agent.is_some() => Ok(Scope::User),
        (None, false) => select_scope(ctx, agent),
    }
}

fn select_scope(ctx: &Context, agent: Agent) -> Result<Scope, CliError> {
    let user_path = agents::user_install_dir(agent, ctx.home.as_deref())?.join(SKILL_FILE_NAME);
    let project_path =
        agents::project_install_dir(agent, &ctx.cwd).map(|dir| dir.join(SKILL_FILE_NAME));

    ctx.ui
        .line(&format!("  1: user    {}", user_path.display()));
    let custom_choice = match &project_path {
        Some(path) => {
            ctx.ui.line(&format!("  2: project {}", path.display()));
            ctx.ui.line("  3: custom path");
            "3"
        }
        None => {
            ctx.ui.line("  2: custom path");
            "2"
        }
    };

    let closed = || CliError::usage("Input stream closed");
    let answer = ask(&ctx.ui, "? Install to: ")?.ok_or_else(closed)?;
    match answer.as_str() {
        "1" | "user" => Ok(Scope::User),
        "2" | "project" if project_path.is_some() => Ok(Scope::Project),
        choice if choice == custom_choice || choice == "custom" => {
            let dir = ask(&ctx.ui, "? Path: ")?.ok_or_else(closed)?;
            Ok(Scope::Custom(dir))
        }
        _ => Err(CliError::usage(format!("Invalid selection: {answer}"))),
    }
}

fn install(ctx: &Context, args: &SkillsTargetArgs) -> Result<(), CliError> {
    let agent = resolve_agent(ctx, args.agent)?;
    let scope = resolve_scope(ctx, agent, args)?;
    let install_dir = agents::install_dir(agent, &scope, &ctx.cwd, ctx.home.as_deref())?;
    let skill_path = install_dir.join(SKILL_FILE_NAME);

    if fs::read_to_string(&skill_path).is_ok_and(|existing| existing == SKILL_CONTENT) {
        ctx.ui.info("Skills already up to date");
        return Ok(());
    }

    if args.dry_run {
        ctx.ui
            .info(&format!("Would write to: {}", skill_path.display()));
        print_stdout(SKILL_CONTENT, ctx.ui.color());
        return Ok(());
    }

    fs::create_dir_all(&install_dir)?;
    // fs::write follows symlinks; a pre-planted link must not redirect the
    // write outside the install directory.
    if is_symlink(&skill_path) {
        return Err(CliError::usage(format!(
            "Refusing to write through symlink: {}",
            skill_path.display()
        )));
    }
    fs::write(&skill_path, SKILL_CONTENT)?;
    ctx.ui
        .success(&format!("Skills installed to {}", skill_path.display()));
    Ok(())
}

fn is_symlink(path: &Path) -> bool {
    fs::symlink_metadata(path).is_ok_and(|m| m.file_type().is_symlink())
}

fn uninstall(ctx: &Context, args: &SkillsTargetArgs, force: bool) -> Result<(), CliError> {
    let agent = resolve_agent(ctx, args.agent)?;
    let scope = resolve_scope(ctx, agent, args)?;
    let install_dir = agents::install_dir(agent, &scope, &ctx.cwd, ctx.home.as_deref())?;
    let skill_path = install_dir.join(SKILL_FILE_NAME);

    if !install_dir.exists() {
        ctx.ui
            .info(&format!("No lt skills found for {}", agents::name(agent)));
        return Ok(());
    }
    if !skill_path.exists() {
        ctx.ui
            .info(&format!("No skill file found at {}", skill_path.display()));
        return Ok(());
    }

    let only_skill_file = || -> io::Result<bool> {
        let entries: Vec<_> = fs::read_dir(&install_dir)?.collect::<Result<_, _>>()?;
        Ok(entries.len() == 1 && entries[0].file_name() == SKILL_FILE_NAME)
    };

    if args.dry_run {
        ctx.ui
            .info(&format!("Would remove: {}", skill_path.display()));
        if only_skill_file()? {
            ctx.ui.info(&format!(
                "Would remove directory: {}",
                install_dir.display()
            ));
        }
        return Ok(());
    }

    if !force
        && !confirm(
            &ctx.ui,
            ctx.stdin_tty,
            &format!("Remove {}?", skill_path.display()),
        )?
    {
        ctx.ui.info("Cancelled");
        return Ok(());
    }

    if !only_skill_file()? {
        fs::remove_file(&skill_path)?;
        ctx.ui.success(&format!("Removed {}", skill_path.display()));
        ctx.ui.warn(&format!(
            "Directory {} contains other files, kept intact",
            install_dir.display()
        ));
        return Ok(());
    }

    fs::remove_dir_all(&install_dir)?;
    ctx.ui
        .success(&format!("Removed {}", install_dir.display()));
    Ok(())
}
