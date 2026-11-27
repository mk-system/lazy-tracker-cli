use serde::Serialize;
use serde_json::Value;

use crate::api::client::{Method, build_url, call};
use crate::context::Context;
use crate::error::CliError;

fn request<B: Serialize>(
    ctx: &Context,
    method: Method,
    segments: &[&str],
    body: Option<&B>,
) -> Result<Value, CliError> {
    let mut path = vec!["api", "v1"];
    path.extend_from_slice(segments);
    let url = build_url(ctx.api_url()?, &path)?;
    let body = body
        .map(serde_json::to_value)
        .transpose()
        .map_err(|e| CliError::usage(format!("Failed to encode request: {e}")))?;
    call(ctx, method, &url, body.as_ref())
}

fn get(ctx: &Context, segments: &[&str]) -> Result<Value, CliError> {
    request::<()>(ctx, Method::Get, segments, None)
}

/// `Null` stands for an empty or non-JSON body, which has always meant "no
/// items"; any other JSON value means the response is not what we expect.
fn list(value: Value) -> Result<Vec<Value>, CliError> {
    match value {
        Value::Array(items) => Ok(items),
        Value::Null => Ok(Vec::new()),
        other => Err(CliError::usage(format!(
            "Unexpected response from the server: expected a list, got {}",
            json_kind(&other)
        ))),
    }
}

fn json_kind(value: &Value) -> &'static str {
    match value {
        Value::Object(_) => "an object",
        Value::String(_) => "a string",
        Value::Number(_) => "a number",
        Value::Bool(_) => "a boolean",
        Value::Array(_) | Value::Null => "a list",
    }
}

pub fn my_teams(ctx: &Context) -> Result<Vec<Value>, CliError> {
    get(ctx, &["teams", "my"]).and_then(list)
}

pub fn projects(ctx: &Context) -> Result<Vec<Value>, CliError> {
    get(ctx, &["projects"]).and_then(list)
}

pub fn recent_projects(ctx: &Context) -> Result<Vec<Value>, CliError> {
    get(ctx, &["projects", "recent"]).and_then(list)
}

pub fn team_projects(ctx: &Context, team: &str) -> Result<Vec<Value>, CliError> {
    get(ctx, &["projects", "team", team]).and_then(list)
}

pub fn tickets(ctx: &Context) -> Result<Vec<Value>, CliError> {
    get(ctx, &["tickets"]).and_then(list)
}

pub fn team_tickets(ctx: &Context, team: &str) -> Result<Vec<Value>, CliError> {
    get(ctx, &["teams", team, "tickets"]).and_then(list)
}

pub fn project_tickets(ctx: &Context, team: &str, project: &str) -> Result<Vec<Value>, CliError> {
    get(ctx, &["teams", team, "projects", project, "tickets"]).and_then(list)
}

pub fn ticket(ctx: &Context, ticket_id: &str) -> Result<Value, CliError> {
    get(ctx, &["tickets", ticket_id])
}

pub fn ticket_by_number(
    ctx: &Context,
    team: &str,
    project: &str,
    number: &str,
) -> Result<Value, CliError> {
    get(
        ctx,
        &[
            "teams",
            team,
            "projects",
            project,
            "tickets",
            "by-number",
            number,
        ],
    )
}

#[derive(Debug, Serialize)]
pub struct TicketCreateRequest {
    pub title: String,
    pub description: String,
    pub ticket_type: String,
    pub state: String,
    pub list_type: String,
    pub assignee_ids: Vec<String>,
    pub tag_ids: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub point: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub release_date: Option<String>,
}

/// `None` leaves a field out of the request; `Some(None)` sends `null` to
/// clear it on the server.
#[derive(Debug, Default, Serialize)]
pub struct TicketUpdateRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub point: Option<Option<i32>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub release_date: Option<Option<String>>,
}

#[derive(Debug, Serialize)]
pub struct ChatMessage<'a> {
    pub message: &'a str,
}

pub fn create_ticket(
    ctx: &Context,
    team: &str,
    project: &str,
    body: &TicketCreateRequest,
) -> Result<Value, CliError> {
    request(
        ctx,
        Method::Post,
        &["teams", team, "projects", project, "tickets"],
        Some(body),
    )
}

pub fn update_ticket(
    ctx: &Context,
    ticket_id: &str,
    body: &TicketUpdateRequest,
) -> Result<Value, CliError> {
    request(ctx, Method::Put, &["tickets", ticket_id], Some(body))
}

pub fn delete_ticket(ctx: &Context, ticket_id: &str) -> Result<(), CliError> {
    request::<()>(ctx, Method::Delete, &["tickets", ticket_id], None).map(drop)
}

pub fn chats(ctx: &Context, ticket_id: &str) -> Result<Vec<Value>, CliError> {
    get(ctx, &["tickets", ticket_id, "chats"]).and_then(list)
}

pub fn create_chat(ctx: &Context, ticket_id: &str, message: &str) -> Result<Value, CliError> {
    request(
        ctx,
        Method::Post,
        &["tickets", ticket_id, "chats"],
        Some(&ChatMessage { message }),
    )
}

pub fn update_chat(ctx: &Context, chat_id: &str, message: &str) -> Result<Value, CliError> {
    request(
        ctx,
        Method::Put,
        &["chats", chat_id],
        Some(&ChatMessage { message }),
    )
}

pub fn delete_chat(ctx: &Context, chat_id: &str) -> Result<(), CliError> {
    request::<()>(ctx, Method::Delete, &["chats", chat_id], None).map(drop)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn a_list_endpoint_answering_with_a_non_list_is_an_error() {
        assert_eq!(list(json!([1])).unwrap(), vec![json!(1)]);
        assert!(list(Value::Null).unwrap().is_empty());
        let err = list(json!({"message": "maintenance"})).unwrap_err();
        assert!(err.to_string().contains("expected a list, got an object"));
    }

    #[test]
    fn update_request_omits_unset_fields_and_sends_null_for_cleared_ones() {
        let body = TicketUpdateRequest {
            title: Some("New".into()),
            point: Some(None),
            ..TicketUpdateRequest::default()
        };
        assert_eq!(
            serde_json::to_string(&body).unwrap(),
            r#"{"title":"New","point":null}"#
        );
    }

    #[test]
    fn create_request_uses_snake_case_field_names() {
        let body = TicketCreateRequest {
            title: "T".into(),
            description: String::new(),
            ticket_type: "normal".into(),
            state: "created".into(),
            list_type: "icebox".into(),
            assignee_ids: vec![],
            tag_ids: vec![],
            point: Some(3),
            release_date: None,
        };
        assert_eq!(
            serde_json::to_string(&body).unwrap(),
            r#"{"title":"T","description":"","ticket_type":"normal","state":"created","list_type":"icebox","assignee_ids":[],"tag_ids":[],"point":3}"#
        );
    }
}
