use serde_json::{Value, json};

use crate::api::endpoints;
use crate::cli::{CommentsCommand, TicketTarget};
use crate::commands::with_spinner;
use crate::context::Context;
use crate::error::CliError;
use crate::output::json::print_json;
use crate::output::prompt::confirm;
use crate::ticket_ref::{self, scope_fields};

pub fn run(ctx: &Context, command: CommentsCommand) -> Result<(), CliError> {
    match command {
        CommentsCommand::List(target) => list(ctx, &target),
        CommentsCommand::Add { target, message } => add(ctx, &target, &message),
        CommentsCommand::Update { chat_id, message } => update(ctx, &chat_id, &message),
        CommentsCommand::Delete { chat_id, force } => delete(ctx, &chat_id, force),
    }
}

fn resolve(
    ctx: &Context,
    target: &TicketTarget,
) -> Result<(String, serde_json::Map<String, Value>), CliError> {
    let (ticket_id, scope) = ticket_ref::resolve_ticket_id(
        ctx,
        &target.ticket,
        target.team.as_deref(),
        target.project.as_deref(),
    )?;
    Ok((ticket_id, scope_fields(scope.as_ref())))
}

fn list(ctx: &Context, target: &TicketTarget) -> Result<(), CliError> {
    let (ticket_id, mut output, chats) = with_spinner(
        ctx,
        "Fetching comments...",
        "Failed to fetch comments",
        || {
            let (ticket_id, output) = resolve(ctx, target)?;
            let chats = endpoints::chats(ctx, &ticket_id)?;
            Ok((ticket_id, output, chats))
        },
    )?;
    ctx.ui
        .succeed_spinner(&format!("Found {} comment(s)", chats.len()));

    output.insert("ticketId".into(), Value::String(ticket_id));
    output.insert("count".into(), json!(chats.len()));
    output.insert("comments".into(), Value::Array(chats));
    print_json(&Value::Object(output));
    Ok(())
}

fn add(ctx: &Context, target: &TicketTarget, message: &str) -> Result<(), CliError> {
    // Resolution failures get their own failure line so a failed lookup is
    // never read as "the comment may have been posted".
    let (ticket_id, mut output) = with_spinner(
        ctx,
        "Resolving ticket...",
        "Failed to resolve ticket",
        || resolve(ctx, target),
    )?;

    ctx.ui.update_spinner("Adding comment...");
    let comment = endpoints::create_chat(ctx, &ticket_id, message)
        .inspect_err(|_| ctx.ui.fail_spinner("Failed to add comment"))?;
    ctx.ui.succeed_spinner("Comment added");

    output.insert("ticketId".into(), Value::String(ticket_id));
    output.insert("comment".into(), comment);
    print_json(&Value::Object(output));
    Ok(())
}

fn update(ctx: &Context, chat_id: &str, message: &str) -> Result<(), CliError> {
    let comment = with_spinner(
        ctx,
        "Updating comment...",
        "Failed to update comment",
        || endpoints::update_chat(ctx, chat_id, message),
    )?;
    ctx.ui.succeed_spinner("Comment updated");

    print_json(&json!({ "comment": comment }));
    Ok(())
}

fn delete(ctx: &Context, chat_id: &str, force: bool) -> Result<(), CliError> {
    if !force
        && !confirm(
            &ctx.ui,
            ctx.stdin_tty,
            "Are you sure you want to delete this comment?",
        )?
    {
        ctx.ui.line("Cancelled.");
        return Ok(());
    }

    with_spinner(
        ctx,
        "Deleting comment...",
        "Failed to delete comment",
        || endpoints::delete_chat(ctx, chat_id),
    )?;
    ctx.ui.succeed_spinner("Comment deleted");

    print_json(&json!({ "deleted": true, "chatId": chat_id }));
    Ok(())
}
