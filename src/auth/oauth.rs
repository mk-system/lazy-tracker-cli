use serde::Deserialize;
use serde_json::Value;

use crate::api::client::{Method, RawResponse, build_url, transmit};
use crate::context::Context;
use crate::error::CliError;

/// POSTs to `/api/v1/oauth/<endpoint>` without a bearer token. Neither body
/// is logged: requests carry device codes or refresh tokens and successful
/// responses carry new tokens.
pub fn post(
    ctx: &Context,
    endpoint: &[&str],
    body: &Value,
    network_message: impl FnOnce(&ureq::Error) -> String,
) -> Result<RawResponse, CliError> {
    let mut segments = vec!["api", "v1", "oauth"];
    segments.extend_from_slice(endpoint);
    let url = build_url(ctx.api_url()?, &segments)?;
    transmit(ctx, Method::Post, &url, None, Some(body)).map_err(|e| {
        let message = network_message(&e);
        CliError::network(message, e)
    })
}

#[derive(Debug, Default, Deserialize)]
pub struct OAuthError {
    #[serde(default)]
    pub error: Option<String>,
    #[serde(default)]
    pub error_description: Option<String>,
}

impl OAuthError {
    pub fn parse(body: &str) -> Option<Self> {
        serde_json::from_str(body).ok()
    }

    pub fn code(&self) -> Option<&str> {
        self.error.as_deref()
    }

    pub fn description(&self) -> Option<&str> {
        self.error_description.as_deref().filter(|d| !d.is_empty())
    }
}
