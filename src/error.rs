use std::error::Error as StdError;

use crate::log::truncate_for_log;
use crate::output::style;

pub type BoxError = Box<dyn StdError + Send + Sync + 'static>;

#[derive(Debug, thiserror::Error)]
pub enum StoreError {
    #[error("{0}")]
    Unavailable(String),
    #[error(
        "Stored credentials are unreadable ({0}). Run `lt auth login --force` to sign in again."
    )]
    Corrupt(String),
}

#[derive(Debug, thiserror::Error)]
pub enum CliError {
    #[error("{0}")]
    Auth(String),
    #[error("{message}")]
    Api {
        message: String,
        status: u16,
        body: Option<String>,
    },
    #[error("{message}")]
    Network {
        message: String,
        #[source]
        source: BoxError,
    },
    #[error(transparent)]
    Store(#[from] StoreError),
    #[error("{0}")]
    Usage(String),
}

impl CliError {
    pub fn usage(message: impl Into<String>) -> Self {
        Self::Usage(message.into())
    }

    pub fn network(message: impl Into<String>, source: impl Into<BoxError>) -> Self {
        Self::Network {
            message: message.into(),
            source: source.into(),
        }
    }
}

impl From<std::io::Error> for CliError {
    fn from(err: std::io::Error) -> Self {
        Self::Usage(err.to_string())
    }
}

/// Renders an error for stderr. Verbose mode appends the HTTP status, the raw
/// response body and the cause chain, which the one-line message hides.
pub fn format_error(err: &(dyn StdError + 'static), verbose: bool) -> String {
    let message = err.to_string();
    if !verbose {
        return message;
    }

    let mut lines = Vec::new();
    if let Some(CliError::Api { status, body, .. }) = err.downcast_ref::<CliError>() {
        lines.push(format!("  status: {status}"));
        if let Some(body) = body.as_deref().filter(|b| !b.is_empty()) {
            lines.push(format!("  response: {}", truncate_for_log(body)));
        }
    }

    let mut cause = err.source();
    while let Some(inner) = cause {
        lines.push(format!("  caused by: {inner}"));
        cause = inner.source();
    }

    if lines.is_empty() {
        message
    } else {
        format!("{message}\n{}", style::dim(&lines.join("\n")))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn api_error(status: u16, body: Option<&str>) -> CliError {
        CliError::Api {
            message: format!("Request failed with status {status}"),
            status,
            body: body.map(str::to_owned),
        }
    }

    #[derive(Debug, thiserror::Error)]
    #[error("ECONNREFUSED")]
    struct Refused;

    #[test]
    fn without_verbose_only_the_message_is_shown() {
        let err = api_error(400, Some(r#"{"error":"bad id"}"#));
        assert_eq!(format_error(&err, false), "Request failed with status 400");
    }

    #[test]
    fn verbose_adds_http_status_and_raw_response_body() {
        let err = api_error(400, Some(r#"{"error":"ticket_id must be a UUID"}"#));
        let formatted = format_error(&err, true);

        assert!(formatted.starts_with("Request failed with status 400\n"));
        assert!(formatted.contains("status: 400"));
        assert!(formatted.contains(r#"response: {"error":"ticket_id must be a UUID"}"#));
    }

    #[test]
    fn verbose_truncates_an_oversized_response_body() {
        let body = "y".repeat(2500);
        let formatted = format_error(&api_error(500, Some(&body)), true);

        assert!(formatted.contains("… (truncated)"));
        assert!(!formatted.contains(&"y".repeat(2001)));
    }

    #[test]
    fn verbose_omits_the_response_line_when_no_body_was_captured() {
        let formatted = format_error(&api_error(502, None), true);

        assert!(formatted.contains("status: 502"));
        assert!(!formatted.contains("response:"));
    }

    #[test]
    fn verbose_does_not_repeat_the_message() {
        let formatted = format_error(&CliError::Auth("Session expired.".into()), true);
        assert_eq!(formatted.matches("Session expired.").count(), 1);
    }

    #[test]
    fn verbose_walks_the_cause_chain_so_the_underlying_failure_is_visible() {
        let err = CliError::network("Network error: ECONNREFUSED", Refused);
        assert!(format_error(&err, true).contains("caused by: ECONNREFUSED"));
    }
}
