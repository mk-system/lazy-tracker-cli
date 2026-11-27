use std::time::Instant;

use serde_json::Value;
use url::Url;

use crate::api::case::camelize_keys;
use crate::auth::session::{self, Trigger};
use crate::context::Context;
use crate::error::CliError;
use crate::log::truncate_for_log;

const MAX_BODY_BYTES: u64 = 64 * 1024 * 1024;

pub const SESSION_REJECTED: &str =
    "The server rejected the saved session. Run `lt auth login --force` to sign in again.";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Method {
    Get,
    Post,
    Put,
    Delete,
}

impl Method {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Get => "GET",
            Self::Post => "POST",
            Self::Put => "PUT",
            Self::Delete => "DELETE",
        }
    }
}

pub struct RawResponse {
    pub status: u16,
    pub content_type: String,
    pub body: String,
}

impl RawResponse {
    pub fn is_success(&self) -> bool {
        (200..300).contains(&self.status)
    }
}

pub fn build_url(base: &str, segments: &[&str]) -> Result<String, CliError> {
    let invalid = || CliError::usage(format!("Invalid API URL: {base}"));
    if let Some(segment) = segments.iter().find(|s| matches!(**s, "" | "." | "..")) {
        return Err(CliError::usage(format!(
            "Invalid identifier: \"{segment}\""
        )));
    }
    let mut url = Url::parse(base).map_err(|_| invalid())?;
    url.path_segments_mut()
        .map_err(|_| invalid())?
        .pop_if_empty()
        .extend(segments);
    Ok(url.into())
}

/// Logs only method, URL and status; never headers or bodies.
pub fn transmit(
    ctx: &Context,
    method: Method,
    url: &str,
    bearer: Option<&str>,
    body: Option<&Value>,
) -> Result<RawResponse, ureq::Error> {
    let started = Instant::now();
    ctx.ui.debug_request(method.as_str(), url);
    let authorization = bearer.map(|token| format!("Bearer {token}"));
    let result = match method {
        Method::Get => with_auth(ctx.http.get(url), authorization.as_deref()).call(),
        Method::Delete => with_auth(ctx.http.delete(url), authorization.as_deref()).call(),
        Method::Post => send_body(
            with_auth(ctx.http.post(url), authorization.as_deref()),
            body,
        ),
        Method::Put => send_body(with_auth(ctx.http.put(url), authorization.as_deref()), body),
    };
    let mut response = result?;
    let status = response.status().as_u16();
    ctx.ui
        .debug_response(method.as_str(), url, status, started.elapsed().as_millis());
    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or_default()
        .to_owned();
    let bytes = response
        .body_mut()
        .with_config()
        .limit(MAX_BODY_BYTES)
        .read_to_vec()?;
    Ok(RawResponse {
        status,
        content_type,
        body: String::from_utf8_lossy(&bytes).into_owned(),
    })
}

fn with_auth<B>(
    request: ureq::RequestBuilder<B>,
    authorization: Option<&str>,
) -> ureq::RequestBuilder<B> {
    match authorization {
        Some(value) => request.header("Authorization", value),
        None => request,
    }
}

fn send_body(
    request: ureq::RequestBuilder<ureq::typestate::WithBody>,
    body: Option<&Value>,
) -> Result<ureq::http::Response<ureq::Body>, ureq::Error> {
    match body {
        Some(body) => request.send_json(body),
        None => request.send_empty(),
    }
}

/// A 401 only says the access token was refused; whether the refresh token
/// is dead is known only from the token endpoint.
pub fn call(
    ctx: &Context,
    method: Method,
    url: &str,
    body: Option<&Value>,
) -> Result<Value, CliError> {
    let tokens = session::credentials(ctx)?;
    let mut response = send(ctx, method, url, &tokens.access_token, body)?;
    if response.status == 401 {
        ctx.ui
            .debug("401 received: refreshing the session and retrying once");
        let refreshed = session::refresh(ctx, &tokens.refresh_token, Trigger::Rejected)?;
        response = send(ctx, method, url, &refreshed.access_token, body)?;
        if response.status == 401 {
            return Err(CliError::Auth(SESSION_REJECTED.to_owned()));
        }
    }
    interpret(response)
}

fn send(
    ctx: &Context,
    method: Method,
    url: &str,
    access_token: &str,
    body: Option<&Value>,
) -> Result<RawResponse, CliError> {
    let response = transmit(ctx, method, url, Some(access_token), body)
        .map_err(|e| CliError::network(format!("Network error: {e}"), e))?;
    if !response.is_success() && !response.body.is_empty() {
        ctx.ui.debug(&format!(
            "response body: {}",
            truncate_for_log(&response.body)
        ));
    }
    Ok(response)
}

fn interpret(response: RawResponse) -> Result<Value, CliError> {
    if !response.is_success() {
        let fallback = format!("Request failed with status {}", response.status);
        return Err(CliError::Api {
            message: error_message(&response.body).unwrap_or(fallback),
            status: response.status,
            body: (!response.body.is_empty()).then_some(response.body),
        });
    }
    if !response.content_type.contains("application/json") || response.body.trim().is_empty() {
        return Ok(Value::Null);
    }
    let parsed: Value = serde_json::from_str(&response.body)
        .map_err(|e| CliError::network(format!("Network error: invalid JSON response: {e}"), e))?;
    Ok(camelize_keys(parsed))
}

pub fn error_message(body: &str) -> Option<String> {
    let parsed = camelize_keys(serde_json::from_str(body).ok()?);
    ["message", "error"].iter().find_map(|key| {
        parsed
            .get(key)
            .and_then(Value::as_str)
            .filter(|s| !s.is_empty())
            .map(str::to_owned)
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::store::memory::MemoryStore;
    use crate::auth::token::{TokenData, now_ms};
    use crate::mock_server::{MockServer, Route};
    use std::sync::{Arc, Mutex};

    const TOKEN: &str = "secret-access-token";
    const PATH: &str = "/api/v1/tickets/213/chats";
    const REFRESH_OK: &str = r#"{"access_token":"fresh-access","refresh_token":"fresh-refresh","expires_in":3600,"scope":"read write"}"#;

    fn valid_tokens() -> TokenData {
        TokenData {
            access_token: TOKEN.into(),
            refresh_token: "refresh-1".into(),
            expires_at: now_ms() + 3_600_000,
            refresh_token_expires_at: None,
            scope: "read write".into(),
            api_origin: None,
        }
    }

    struct Harness {
        server: MockServer,
        ctx: Context,
        log: Arc<Mutex<Vec<u8>>>,
        _dir: tempfile::TempDir,
    }

    impl Harness {
        fn new(routes: Vec<Route>) -> Self {
            let server = MockServer::start(routes);
            let dir = tempfile::tempdir().unwrap();
            let (ctx, log) = Context::for_tests(
                &server.url(),
                Box::new(MemoryStore::with(TokenData {
                    api_origin: crate::config::api_url::origin_of(&server.url()),
                    ..valid_tokens()
                })),
                dir.path().to_path_buf(),
            );
            Self {
                server,
                ctx,
                log,
                _dir: dir,
            }
        }

        fn get(&self) -> Result<Value, CliError> {
            let url = build_url(
                &self.server.url(),
                &["api", "v1", "tickets", "213", "chats"],
            )
            .unwrap();
            call(&self.ctx, Method::Get, &url, None)
        }

        fn log(&self) -> String {
            String::from_utf8(self.log.lock().unwrap().clone()).unwrap()
        }
    }

    #[test]
    fn logs_method_url_and_status_but_never_the_authorization_header() {
        let h = Harness::new(vec![
            Route::new("GET", PATH)
                .status(400)
                .json(r#"{"error":"ticket_id must be a UUID"}"#),
        ]);
        let _ = h.get();
        let log = h.log();

        assert!(log.contains(&format!("→ GET {}{PATH}", h.server.url())));
        assert!(log.contains(&format!("← 400 GET {}{PATH}", h.server.url())));
        assert!(log.contains(r#"response body: {"error":"ticket_id must be a UUID"}"#));
        assert!(!log.contains(TOKEN));
        assert!(!log.contains("Authorization"));
        assert_eq!(
            h.server.requests()[0].header("authorization"),
            Some(format!("Bearer {TOKEN}").as_str())
        );
    }

    #[test]
    fn keeps_the_raw_error_body_and_uses_its_error_field_as_the_message() {
        let h = Harness::new(vec![
            Route::new("GET", PATH)
                .status(400)
                .json(r#"{"error":"ticket_id must be a UUID"}"#),
        ]);
        match h.get().unwrap_err() {
            CliError::Api {
                message,
                status,
                body,
            } => {
                assert_eq!(message, "ticket_id must be a UUID");
                assert_eq!(status, 400);
                assert_eq!(
                    body.as_deref(),
                    Some(r#"{"error":"ticket_id must be a UUID"}"#)
                );
            }
            other => panic!("unexpected {other:?}"),
        }
    }

    #[test]
    fn a_non_json_error_body_falls_back_to_the_status_message_but_is_kept() {
        let h = Harness::new(vec![
            Route::new("GET", PATH)
                .status(502)
                .text("text/html", "<html>502 Bad Gateway</html>"),
        ]);
        match h.get().unwrap_err() {
            CliError::Api { message, body, .. } => {
                assert_eq!(message, "Request failed with status 502");
                assert_eq!(body.as_deref(), Some("<html>502 Bad Gateway</html>"));
            }
            other => panic!("unexpected {other:?}"),
        }
    }

    #[test]
    fn response_keys_are_camelized_in_server_order_and_unknown_fields_survive() {
        let h = Harness::new(vec![Route::new("GET", PATH).json(
            r#"[{"z_last":1,"ticket_id":"t","brand_new_field":{"nested_key":true}}]"#,
        )]);
        let value = h.get().unwrap();
        let first = value[0].as_object().unwrap();

        let keys: Vec<_> = first.keys().cloned().collect();
        assert_eq!(keys, ["zLast", "ticketId", "brandNewField"]);
        assert_eq!(first["brandNewField"]["nestedKey"], Value::Bool(true));
    }

    #[test]
    fn a_401_refreshes_once_and_replays_the_request() {
        let h = Harness::new(vec![
            Route::new("GET", PATH).status(401).times(1),
            Route::new("POST", "/api/v1/oauth/token").json(REFRESH_OK),
            Route::new("GET", PATH).json("[]"),
        ]);
        assert_eq!(h.get().unwrap(), Value::Array(vec![]));

        let gets: Vec<_> = h
            .server
            .requests()
            .into_iter()
            .filter(|r| r.method == "GET")
            .collect();
        assert_eq!(gets.len(), 2);
        assert_eq!(gets[1].header("authorization"), Some("Bearer fresh-access"));
        assert_eq!(
            h.ctx.store.load().unwrap().unwrap().refresh_token,
            "fresh-refresh"
        );
    }

    #[test]
    fn a_second_401_fails_with_force_login_guidance_but_keeps_the_tokens() {
        let h = Harness::new(vec![
            Route::new("GET", PATH).status(401),
            Route::new("POST", "/api/v1/oauth/token").json(REFRESH_OK),
        ]);
        let err = h.get().unwrap_err();

        assert!(matches!(err, CliError::Auth(_)));
        assert!(err.to_string().contains("lt auth login --force"));
        assert!(h.ctx.store.load().unwrap().is_some());
        assert_eq!(h.server.count("POST", "/api/v1/oauth/token"), 1);
    }

    #[test]
    fn empty_and_dot_segments_are_rejected_instead_of_changing_the_path() {
        for segment in ["", ".", ".."] {
            let err = build_url(
                "https://api.example.com",
                &["api", "v1", "tickets", segment],
            )
            .unwrap_err();
            assert!(matches!(err, CliError::Usage(_)));
        }
    }

    #[test]
    fn path_segments_are_percent_encoded() {
        let url = build_url(
            "https://api.example.com",
            &["api", "v1", "teams", "a/b?c#d e"],
        )
        .unwrap();
        assert_eq!(
            url,
            "https://api.example.com/api/v1/teams/a%2Fb%3Fc%23d%20e"
        );
    }

    #[test]
    fn a_base_url_path_prefix_is_kept() {
        let url = build_url("https://example.com/lt/", &["api", "v1", "teams", "my"]).unwrap();
        assert_eq!(url, "https://example.com/lt/api/v1/teams/my");
    }
}
