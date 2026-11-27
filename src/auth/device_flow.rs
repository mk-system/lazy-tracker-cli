//! OAuth 2.0 Device Authorization Grant (RFC 8628) as a public client.

use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

use serde::Deserialize;
use serde_json::json;

use crate::auth::oauth::{self, OAuthError};
use crate::auth::session;
use crate::auth::token::{TokenData, TokenResponse, now_ms};
use crate::auth::{CLIENT_ID, DEFAULT_SCOPES};
use crate::config::api_url;
use crate::context::Context;
use crate::error::CliError;

const DEFAULT_INTERVAL_SECS: u64 = 5;
const SLOW_DOWN_STEP_SECS: u64 = 5;

#[derive(Debug, Deserialize)]
pub struct DeviceCode {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    #[serde(default)]
    pub verification_uri_complete: Option<String>,
    pub expires_in: u64,
    #[serde(default)]
    pub interval: Option<u64>,
}

impl DeviceCode {
    pub fn interval(&self) -> Duration {
        Duration::from_secs(
            self.interval
                .filter(|i| *i > 0)
                .unwrap_or(DEFAULT_INTERVAL_SECS),
        )
    }
}

pub fn request_device_code(ctx: &Context) -> Result<DeviceCode, CliError> {
    let body = json!({ "client_id": CLIENT_ID, "scope": DEFAULT_SCOPES });
    let response = oauth::post(ctx, &["device", "code"], &body, |e| {
        format!("Failed to connect to API: {e}")
    })?;
    if !response.is_success() {
        let message = OAuthError::parse(&response.body)
            .and_then(|e| e.description().map(str::to_owned))
            .unwrap_or_else(|| format!("Failed to request device code: {}", response.status));
        return Err(CliError::Auth(message));
    }
    serde_json::from_str(&response.body).map_err(|e| {
        CliError::network(
            format!("Failed to connect to API: invalid response ({e})"),
            e,
        )
    })
}

/// Polls the token endpoint until the user approves, refuses, or the code
/// expires. The first poll is immediate; `slow_down` lengthens the interval
/// for every later poll, as RFC 8628 §3.5 requires.
pub fn poll_for_token(
    ctx: &Context,
    code: &DeviceCode,
    sleep: &mut dyn FnMut(Duration),
) -> Result<TokenData, CliError> {
    let deadline = Instant::now()
        .checked_add(Duration::from_secs(code.expires_in))
        .ok_or_else(|| {
            CliError::Auth("The server returned an invalid device code lifetime.".to_owned())
        })?;
    let mut interval = code.interval();
    let body = json!({
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": code.device_code,
        "client_id": CLIENT_ID,
    });

    loop {
        if Instant::now() >= deadline {
            return Err(CliError::Auth(
                "Device code expired. Please try again.".to_owned(),
            ));
        }
        let response = oauth::post(ctx, &["token"], &body, |e| {
            format!("Failed to poll for token: {e}")
        })?;

        if response.is_success() {
            let parsed: TokenResponse = serde_json::from_str(&response.body).map_err(|e| {
                CliError::network(
                    format!("Failed to poll for token: invalid response ({e})"),
                    e,
                )
            })?;
            return parsed
                .into_token_data(now_ms(), None, session::api_origin(ctx)?)
                .ok_or_else(|| {
                    CliError::Auth(
                        "The server did not return a refresh token. Please try again.".to_owned(),
                    )
                });
        }

        let error = OAuthError::parse(&response.body).ok_or_else(|| {
            CliError::Auth(format!(
                "Authorization failed: unexpected response with status {}",
                response.status
            ))
        })?;
        match error.code() {
            Some("authorization_pending") => sleep(interval),
            Some("slow_down") => {
                interval += Duration::from_secs(SLOW_DOWN_STEP_SECS);
                sleep(interval);
            }
            Some("access_denied") => {
                return Err(CliError::Auth(
                    "Access denied. User rejected the authorization request.".to_owned(),
                ));
            }
            Some("expired_token") => {
                return Err(CliError::Auth(
                    "Device code expired. Please try again.".to_owned(),
                ));
            }
            other => {
                let message = error.description().map(str::to_owned).unwrap_or_else(|| {
                    format!("Authorization failed: {}", other.unwrap_or("unknown_error"))
                });
                return Err(CliError::Auth(message));
            }
        }
    }
}

pub fn open_browser(uri: &str, api_url: &str) -> Result<(), String> {
    let Some(uri) = api_url::safe_url_to_open(uri, api_url) else {
        return Err("refusing to open an unexpected URL".to_owned());
    };
    let opener = if cfg!(target_os = "macos") {
        "/usr/bin/open"
    } else {
        "xdg-open"
    };
    Command::new(opener)
        .arg(uri)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map(drop)
        .map_err(|e| format!("could not run {opener}: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::store::memory::MemoryStore;
    use crate::mock_server::{MockServer, Route};

    const TOKEN_PATH: &str = "/api/v1/oauth/token";
    const ISSUED: &str = r#"{"access_token":"a","refresh_token":"r","expires_in":3600,"refresh_token_expires_in":86400,"scope":"read write","token_type":"Bearer"}"#;

    fn code(interval: Option<u64>) -> DeviceCode {
        DeviceCode {
            device_code: "dev".into(),
            user_code: "ABCD-EFGH".into(),
            verification_uri: "https://example.com/device".into(),
            verification_uri_complete: None,
            expires_in: 600,
            interval,
        }
    }

    fn poll(
        routes: Vec<Route>,
        interval: Option<u64>,
    ) -> (Result<TokenData, CliError>, Vec<Duration>) {
        let server = MockServer::start(routes);
        let dir = tempfile::tempdir().unwrap();
        let (ctx, _) = Context::for_tests(
            &server.url(),
            Box::new(MemoryStore::default()),
            dir.path().into(),
        );
        let mut sleeps = Vec::new();
        let result = poll_for_token(&ctx, &code(interval), &mut |d| sleeps.push(d));
        (result, sleeps)
    }

    #[test]
    fn pending_polls_wait_the_server_interval_until_tokens_arrive() {
        let (result, sleeps) = poll(
            vec![
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"authorization_pending"}"#)
                    .times(2),
                Route::new("POST", TOKEN_PATH).json(ISSUED),
            ],
            Some(3),
        );
        let tokens = result.unwrap();

        assert_eq!(tokens.access_token, "a");
        assert!(tokens.refresh_token_expires_at.is_some());
        assert_eq!(sleeps, [Duration::from_secs(3); 2]);
    }

    #[test]
    fn issued_tokens_record_the_api_that_issued_them() {
        let (result, _) = poll(vec![Route::new("POST", TOKEN_PATH).json(ISSUED)], None);
        assert!(
            result
                .unwrap()
                .api_origin
                .unwrap()
                .starts_with("http://127.0.0.1:")
        );
    }

    #[test]
    fn tokens_without_a_refresh_token_are_refused() {
        let (result, _) = poll(
            vec![Route::new("POST", TOKEN_PATH).json(r#"{"access_token":"a","expires_in":3600}"#)],
            None,
        );
        assert!(result.unwrap_err().to_string().contains("refresh token"));
    }

    #[test]
    fn an_absurd_device_code_lifetime_is_an_error_not_a_panic() {
        let server = MockServer::start(vec![]);
        let dir = tempfile::tempdir().unwrap();
        let (ctx, _) = Context::for_tests(
            &server.url(),
            Box::new(MemoryStore::default()),
            dir.path().into(),
        );
        let forever = DeviceCode {
            expires_in: u64::MAX,
            ..code(None)
        };

        let err = poll_for_token(&ctx, &forever, &mut |_| {}).unwrap_err();
        assert!(err.to_string().contains("device code lifetime"));
        assert!(server.requests().is_empty());
    }

    #[test]
    fn slow_down_lengthens_every_later_interval() {
        let (_, sleeps) = poll(
            vec![
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"slow_down"}"#)
                    .times(1),
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"authorization_pending"}"#)
                    .times(1),
                Route::new("POST", TOKEN_PATH).json(ISSUED),
            ],
            None,
        );
        assert_eq!(sleeps, [Duration::from_secs(10), Duration::from_secs(10)]);
    }

    #[test]
    fn a_denied_request_stops_with_the_rejection_message() {
        let (result, _) = poll(
            vec![
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"access_denied"}"#),
            ],
            Some(1),
        );
        assert_eq!(
            result.unwrap_err().to_string(),
            "Access denied. User rejected the authorization request."
        );
    }

    #[test]
    fn unknown_errors_prefer_the_server_description() {
        let (result, _) = poll(
            vec![
                Route::new("POST", TOKEN_PATH)
                    .status(400)
                    .json(r#"{"error":"server_error","error_description":"try later"}"#),
            ],
            Some(1),
        );
        assert_eq!(result.unwrap_err().to_string(), "try later");
    }

    #[test]
    fn urls_that_fail_the_api_url_rule_are_never_opened() {
        let api = "https://api.example.com";
        assert!(open_browser("http://example.com/device", api).is_err());
        assert!(open_browser("https://evil.example/device", api).is_err());
        assert!(open_browser("file:///etc/passwd", api).is_err());
    }
}
