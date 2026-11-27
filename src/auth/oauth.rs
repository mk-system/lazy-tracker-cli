use serde::Deserialize;
use serde_json::Value;

use crate::api::client::{Method, RawResponse, build_url, transmit};
use crate::context::Context;
use crate::error::CliError;
use crate::output::style;

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
    /// Both fields are flattened to one line: they are printed in error
    /// messages, where an embedded newline could pose as further output.
    pub fn parse(body: &str) -> Option<Self> {
        let parsed: Self = serde_json::from_str(body).ok()?;
        Some(Self {
            error: parsed.error.as_deref().map(style::one_line),
            error_description: parsed.error_description.as_deref().map(style::one_line),
        })
    }

    pub fn code(&self) -> Option<&str> {
        self.error.as_deref()
    }

    pub fn description(&self) -> Option<String> {
        self.error_description
            .as_deref()
            .filter(|d| !d.is_empty())
            .map(str::to_owned)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn oauth_error_fields_are_flattened_to_one_line() {
        let parsed =
            OAuthError::parse(r#"{"error":"bad\n✓ ok","error_description":"x\r\ny"}"#).unwrap();
        assert_eq!(parsed.code(), Some("bad ✓ ok"));
        assert_eq!(parsed.description().as_deref(), Some("x  y"));
    }
}
