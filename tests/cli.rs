#[path = "support/env.rs"]
mod env;
#[path = "support/server.rs"]
mod server;

use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::time::Duration;

use serde_json::{Value, json};

use env::TestEnv;
use server::{MockServer, Route};

const TICKET_ID: &str = "0f8fad5b-d9cb-469f-a165-70867728950e";
// 2100-01-01T00:00:00Z
const FAR_FUTURE_MS: u64 = 4_102_444_800_000;
const TOKEN_PATH: &str = "/api/v1/oauth/token";
const TICKETS_BODY: &str = r#"[
  {"id":"0f8fad5b-d9cb-469f-a165-70867728950e","ticket_number":7,"title":"Fix login","state":"started","list_type":"current_backlog","point":null,"project_key":"web","team_key":"core","new_server_field":{"nested_value":1}},
  {"id":"x2","ticket_number":8,"title":"Docs","state":"accepted","list_type":"done","point":2,"project_key":"web","team_key":"core"}
]"#;

fn logged_in(server: &MockServer) -> TestEnv {
    let env = TestEnv::new(&server.url());
    env.write_tokens("refresh-1", FAR_FUTURE_MS);
    env
}

fn dead_url() -> String {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    drop(listener);
    url
}

#[test]
fn tickets_list_prints_only_the_json_payload_on_stdout() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/tickets").json(TICKETS_BODY),
    ]);
    let env = logged_in(&server);

    let out = env.run(&["tickets", "list"]);
    out.assert_success();
    let json = out.json();

    assert_eq!(json["count"], 2);
    assert_eq!(json["tickets"][0]["ticketNumber"], 7);
    assert_eq!(json["tickets"][0]["listType"], "current_backlog");
    assert_eq!(json["tickets"][0]["newServerField"]["nestedValue"], 1);
    let keys: Vec<_> = json.as_object().unwrap().keys().cloned().collect();
    assert_eq!(keys, ["count", "tickets"]);
    assert!(out.stderr.contains("Found 2 ticket(s)"));
    assert_eq!(
        server.requests()[0].header("authorization"),
        Some("Bearer access-for-refresh-1")
    );
}

#[test]
fn tickets_list_for_a_project_leads_with_team_and_project_and_filters_by_state() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/teams/core/projects/web/tickets").json(TICKETS_BODY),
    ]);
    let env = logged_in(&server);

    let out = env.run(&[
        "tickets", "list", "-t", "core", "-p", "web", "--state", "accepted",
    ]);
    out.assert_success();
    let json = out.json();

    let keys: Vec<_> = json.as_object().unwrap().keys().cloned().collect();
    assert_eq!(keys, ["team", "project", "count", "tickets"]);
    assert_eq!(json["count"], 1);
    assert_eq!(json["tickets"][0]["title"], "Docs");
}

#[test]
fn project_file_supplies_team_and_project() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/teams/core/projects/web/tickets").json("[]"),
    ]);
    let env = logged_in(&server);
    fs::write(
        env.work.join(".lazy-tracker.json"),
        r#"{"team":"core","project":"web","apiUrl":"https://evil.example"}"#,
    )
    .unwrap();

    let out = env.run(&["tickets", "list"]);
    out.assert_success();
    assert_eq!(out.json()["team"], "core");
}

#[test]
fn a_write_by_ticket_number_says_which_project_file_chose_the_target() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/teams/core/projects/web/tickets/by-number/7")
            .json(r#"{"id":"t-7"}"#),
        Route::new("PUT", "/api/v1/tickets/t-7").json(r#"{"id":"t-7"}"#),
    ]);
    let env = logged_in(&server);
    fs::write(
        env.work.join(".lazy-tracker.json"),
        r#"{"team":"core","project":"web"}"#,
    )
    .unwrap();

    let out = env.run(&["tickets", "update", "7", "--state", "started"]);
    out.assert_success();
    assert!(out.stderr.contains("Using team core / project web from "));
    assert!(out.stderr.contains("/work/.lazy-tracker.json"));

    let explicit = env.run(&[
        "tickets",
        "update",
        "7",
        "--state",
        "started",
        "--team",
        "core",
        "--project",
        "web",
    ]);
    explicit.assert_success();
    assert!(!explicit.stderr.contains("Using team"));
}

#[test]
fn tickets_list_table_renders_columns_instead_of_json() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/tickets").json(TICKETS_BODY),
    ]);
    let env = logged_in(&server);

    let out = env.run(&[
        "tickets",
        "list",
        "--table",
        "--columns",
        "ticketNumber,title,point",
    ]);
    out.assert_success();
    let lines: Vec<_> = out.stdout.lines().collect();

    assert_eq!(lines[0].trim_end(), "#  Title      Points");
    assert_eq!(lines[1], "-  ---------  ------");
    assert_eq!(lines[2].trim_end(), "7  Fix login  -");
    assert_eq!(lines[3].trim_end(), "8  Docs       2");
}

#[test]
fn tickets_show_accepts_a_ticket_number_with_team_and_project() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/teams/core/projects/web/tickets/by-number/7")
            .json(r#"{"id":"abc","ticket_number":7}"#),
    ]);
    let env = logged_in(&server);

    let out = env.run(&["tickets", "show", "7", "-t", "core", "-p", "web"]);
    out.assert_success();
    assert_eq!(
        out.json(),
        json!({"team":"core","project":"web","ticket":{"id":"abc","ticketNumber":7}})
    );
}

#[test]
fn tickets_show_accepts_a_uuid_without_team_or_project() {
    let server = MockServer::start(vec![
        Route::new("GET", &format!("/api/v1/tickets/{TICKET_ID}"))
            .json(r#"{"id":"0f8fad5b-d9cb-469f-a165-70867728950e"}"#),
    ]);
    let env = logged_in(&server);

    let out = env.run(&["tickets", "show", TICKET_ID]);
    out.assert_success();
    assert_eq!(out.json(), json!({"ticket":{"id":TICKET_ID}}));
}

#[test]
fn tickets_show_by_number_without_team_or_project_fails_with_guidance() {
    let server = MockServer::start(vec![]);
    let env = logged_in(&server);

    let out = env.run(&["tickets", "show", "7"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stdout.is_empty());
    assert!(out.stderr.contains("Team and project are required"));
    assert!(server.requests().is_empty());
}

#[test]
fn tickets_update_sends_null_to_clear_point_and_release_date() {
    let path = format!("/api/v1/tickets/{TICKET_ID}");
    let server = MockServer::start(vec![
        Route::new("PUT", &path).json(r#"{"id":"x","point":null}"#),
    ]);
    let env = logged_in(&server);

    let out = env.run(&[
        "tickets",
        "update",
        TICKET_ID,
        "--point",
        "null",
        "--release-date",
        "null",
    ]);
    out.assert_success();

    let request = &server.requests()[0];
    let body: Value = serde_json::from_str(&request.body).unwrap();
    assert_eq!(body, json!({"point": null, "release_date": null}));
    assert_eq!(out.json(), json!({"ticket":{"id":"x","point":null}}));
}

#[test]
fn tickets_update_rejects_a_point_with_trailing_garbage() {
    let server = MockServer::start(vec![]);
    let env = logged_in(&server);

    let out = env.run(&["tickets", "update", TICKET_ID, "--point", "3abc"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("non-negative integer"));
    assert!(server.requests().is_empty());
}

#[test]
fn tickets_delete_without_a_terminal_or_force_refuses_before_any_request() {
    let server = MockServer::start(vec![]);
    let env = logged_in(&server);

    let out = env.run(&["tickets", "delete", TICKET_ID]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("--force"));
    assert!(server.requests().is_empty());
}

#[test]
fn tickets_delete_with_force_looks_up_the_title_then_deletes() {
    let path = format!("/api/v1/tickets/{TICKET_ID}");
    let server = MockServer::start(vec![
        Route::new("GET", &path).json(r#"{"id":"x","title":"Old"}"#),
        Route::new("DELETE", &path)
            .status(204)
            .text("text/plain", ""),
    ]);
    let env = logged_in(&server);

    let out = env.run(&["tickets", "delete", TICKET_ID, "--force"]);
    out.assert_success();
    assert_eq!(out.json(), json!({"deleted": true, "ticketId": TICKET_ID}));
    assert_eq!(server.count("DELETE", &path), 1);
}

#[test]
fn comments_add_resolves_a_ticket_number_to_its_uuid() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/teams/core/projects/web/tickets/by-number/7")
            .json(r#"{"id":"uuid-7"}"#),
        Route::new("POST", "/api/v1/tickets/uuid-7/chats").json(r#"{"id":"c1","message":"hi"}"#),
    ]);
    let env = logged_in(&server);

    let out = env.run(&[
        "comments", "add", "7", "-t", "core", "-p", "web", "-m", "hi",
    ]);
    out.assert_success();
    assert_eq!(
        out.json(),
        json!({"team":"core","project":"web","ticketId":"uuid-7","comment":{"id":"c1","message":"hi"}})
    );
    let body: Value = serde_json::from_str(&server.requests()[1].body).unwrap();
    assert_eq!(body, json!({"message": "hi"}));
}

#[test]
fn path_segments_from_user_input_are_percent_encoded() {
    let server = MockServer::start(vec![
        Route::new("GET", "/api/v1/projects/team/a%2Fb%3Fc").json("[]"),
    ]);
    let env = logged_in(&server);

    env.run(&["projects", "--team", "a/b?c", "--json"])
        .assert_success();
    assert_eq!(server.count("GET", "/api/v1/projects/team/a%2Fb%3Fc"), 1);
}

#[test]
fn api_url_flag_overrides_lt_api_url_for_api_requests() {
    let server = MockServer::start(vec![Route::new("GET", "/api/v1/teams/my").json("[]")]);
    let env = TestEnv::new(&dead_url());
    env.write_tokens("refresh-1", FAR_FUTURE_MS);

    let out = env.run(&["--api-url", &server.url(), "teams", "--json"]);
    out.assert_success();
    assert_eq!(out.json(), json!([]));
    assert_eq!(server.count("GET", "/api/v1/teams/my"), 1);
}

#[test]
fn a_plain_http_api_url_to_a_remote_host_is_rejected() {
    let env = TestEnv::new("https://api.example.com");
    let out = env.run(&["--api-url", "http://example.com", "teams"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("Invalid API URL"));

    let env = TestEnv::new("http://example.com");
    env.write_tokens("refresh-1", FAR_FUTURE_MS);
    let out = env.run(&["teams"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("Invalid API URL"));
}

#[test]
fn unknown_arguments_exit_with_the_usage_error_code() {
    let env = TestEnv::new("https://api.example.com");
    assert_eq!(env.run(&["tickets", "list", "--bogus"]).code, Some(2));
    assert_eq!(
        env.run(&["skills", "install", "--agent", "toString"]).code,
        Some(2)
    );
}

#[test]
fn a_network_failure_keeps_the_saved_login() {
    let env = TestEnv::new(&dead_url());
    env.write_tokens("refresh-1", 1_000);

    let out = env.run(&["teams"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("Failed to refresh the session"));
    assert_eq!(env.tokens().unwrap()["refreshToken"], "refresh-1");
}

#[test]
fn concurrent_processes_with_an_expired_token_refresh_only_once() {
    let server = MockServer::start(vec![
        Route::new("POST", TOKEN_PATH)
            .json(r#"{"access_token":"fresh","refresh_token":"refresh-2","expires_in":3600,"scope":"read write"}"#)
            .delay(Duration::from_millis(500)),
        Route::new("GET", "/api/v1/teams/my").json("[]"),
    ]);
    let env = TestEnv::new(&server.url());
    env.write_tokens("refresh-1", 1_000);

    let children: Vec<_> = (0..2)
        .map(|_| {
            env.command()
                .args(["teams", "--json"])
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .spawn()
                .unwrap()
        })
        .collect();
    for child in children {
        let out = env::Outcome::from(child.wait_with_output().unwrap());
        out.assert_success();
    }

    assert_eq!(server.count("POST", TOKEN_PATH), 1);
    assert_eq!(server.count("GET", "/api/v1/teams/my"), 2);
    for request in server.requests().iter().filter(|r| r.method == "GET") {
        assert_eq!(request.header("authorization"), Some("Bearer fresh"));
    }
    assert_eq!(env.tokens().unwrap()["refreshToken"], "refresh-2");
}

#[test]
fn auth_status_without_a_login_reports_not_authenticated() {
    let env = TestEnv::new("https://api.example.com");
    let out = env.run(&["auth", "status"]);
    out.assert_success();
    assert!(out.stdout.contains("Not authenticated"));
    assert!(out.stdout.contains("lt auth login"));
}

#[test]
fn auth_status_shows_utc_expiry_and_the_plaintext_storage() {
    let env = TestEnv::new("https://api.example.com");
    env.write_tokens("refresh-1", FAR_FUTURE_MS);
    let out = env.run(&["auth", "status"]);
    out.assert_success();

    assert!(out.stdout.contains("✓ Authenticated"));
    assert!(
        out.stdout
            .contains("Access token expires: 2100-01-01T00:00:00Z (in ")
    );
    assert!(
        out.stdout
            .contains("Token storage: plaintext file (LT_INSECURE_TOKEN_FILE)")
    );
}

#[test]
fn auth_login_completes_the_device_flow_and_stores_tokens_privately() {
    let server = MockServer::start(vec![]);
    let verify = format!("{}/oauth/device", server.url());
    server.push(Route::new("POST", "/api/v1/oauth/device/code").json(&format!(
        r#"{{"device_code":"dev-1","user_code":"ABCD-EFGH","verification_uri":"{verify}","verification_uri_complete":"{verify}?user_code=ABCD-EFGH","expires_in":600,"interval":1}}"#
    )));
    server.push(
        Route::new("POST", TOKEN_PATH)
            .status(400)
            .json(r#"{"error":"authorization_pending"}"#)
            .times(1),
    );
    server.push(Route::new("POST", TOKEN_PATH).json(
        r#"{"access_token":"issued","refresh_token":"issued-r","expires_in":3600,"refresh_token_expires_in":2592000,"scope":"read write","token_type":"Bearer"}"#,
    ));
    let env = TestEnv::new(&server.url());

    let out = env.run(&["auth", "login"]);
    out.assert_success();

    assert!(out.stdout.is_empty());
    assert!(out.stderr.contains("ABCD-EFGH"));
    assert!(out.stderr.contains("You are now logged in"));
    assert!(out.stderr.contains(&verify));
    let tokens = env.tokens().unwrap();
    assert_eq!(tokens["accessToken"], "issued");
    assert!(tokens["refreshTokenExpiresAt"].is_u64());
    let mode = fs::metadata(env.tokens_path())
        .unwrap()
        .permissions()
        .mode()
        & 0o777;
    assert_eq!(mode, 0o600);

    let polls = server.requests();
    let body: Value = serde_json::from_str(&polls[1].body).unwrap();
    assert_eq!(
        body["grant_type"],
        "urn:ietf:params:oauth:grant-type:device_code"
    );
    assert_eq!(body["device_code"], "dev-1");
}

#[test]
fn auth_login_stops_before_showing_a_verification_url_off_the_api_origin() {
    let server = MockServer::start(vec![Route::new("POST", "/api/v1/oauth/device/code").json(
        r#"{"device_code":"dev-1","user_code":"ABCD-EFGH","verification_uri":"https://example.invalid/device","expires_in":600,"interval":1}"#,
    )]);
    let env = TestEnv::new(&server.url());

    let out = env.run(&["auth", "login"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("unexpected verification URL"));
    assert!(!out.stderr.contains("Visit:"));
    assert!(!out.stderr.contains("ABCD-EFGH"));
    assert_eq!(server.requests().len(), 1);
    assert!(env.tokens().is_none());
}

#[test]
fn auth_login_shows_the_verification_url_without_raw_control_characters() {
    let server = MockServer::start(vec![]);
    let verify = format!("{}/oauth/\\u001b[2Jdevice", server.url());
    server.push(Route::new("POST", "/api/v1/oauth/device/code").json(&format!(
        r#"{{"device_code":"dev-1","user_code":"ABCD-EFGH","verification_uri":"{verify}","expires_in":600,"interval":1}}"#
    )));
    server.push(
        Route::new("POST", TOKEN_PATH)
            .status(400)
            .json(r#"{"error":"access_denied"}"#),
    );
    let env = TestEnv::new(&server.url());

    let out = env.run(&["auth", "login"]);
    assert!(!out.stderr.contains('\u{1b}'));
    assert!(
        out.stderr
            .contains(&format!("{}/oauth/%1B[2Jdevice", server.url()))
    );
}

#[test]
fn auth_login_while_logged_in_does_nothing() {
    let server = MockServer::start(vec![]);
    let env = logged_in(&server);

    let out = env.run(&["auth", "login"]);
    out.assert_success();
    assert!(out.stderr.contains("Already authenticated"));
    assert!(server.requests().is_empty());
}

#[test]
fn tokens_from_another_api_are_not_sent_to_the_api_url_given_on_the_command_line() {
    let server = MockServer::start(vec![Route::new("POST", "/api/v1/oauth/revoke").json("{}")]);
    let env = logged_in(&server);
    let mut tokens = env.tokens().unwrap();
    tokens["apiOrigin"] = "https://api.lazy-tracker.com".into();
    fs::write(env.tokens_path(), tokens.to_string()).unwrap();

    let list = env.run(&["tickets", "list", "--team", "t", "--project", "p"]);
    let logout = env.run(&["auth", "logout", "--revoke"]);
    let login = env.run(&["auth", "login"]);

    assert_eq!(login.code, Some(1));
    assert!(login.stderr.contains("lt auth login --force"));
    assert!(!login.stderr.contains("Already authenticated"));
    assert_eq!(list.code, Some(1));
    assert!(
        list.stderr
            .contains("logged in to https://api.lazy-tracker.com")
    );
    assert_eq!(logout.code, Some(1));
    assert!(server.requests().is_empty());
    assert_eq!(env.tokens().unwrap(), tokens);
}

#[test]
fn auth_logout_revoke_sends_only_the_access_token_and_clears_tokens() {
    let server = MockServer::start(vec![Route::new("POST", "/api/v1/oauth/revoke").json("{}")]);
    let env = logged_in(&server);
    let access = env.tokens().unwrap()["accessToken"].clone();

    let out = env.run(&["auth", "logout", "--revoke"]);
    out.assert_success();
    let revokes = server.requests();
    assert_eq!(revokes.len(), 1);
    let body: Value = serde_json::from_str(&revokes[0].body).unwrap();
    assert_eq!(body["token"], access);
    assert_eq!(body["token_type_hint"], "access_token");
    assert!(!env.tokens_path().exists());
}

#[test]
fn auth_logout_with_a_failed_revoke_fails_but_still_clears_tokens() {
    let server = MockServer::start(vec![Route::new("POST", "/api/v1/oauth/revoke").status(500)]);
    let env = logged_in(&server);

    let out = env.run(&["auth", "logout", "--revoke"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("Failed to revoke token"));
    assert!(out.stderr.contains("Logged out successfully."));
    assert!(!env.tokens_path().exists());
}

#[test]
fn config_set_persists_and_config_shows_it() {
    let env = TestEnv::new("https://api.example.com");
    env.run(&["config:set", "default-team", "core"])
        .assert_success();

    let out = env.run(&["config"]);
    out.assert_success();
    assert!(out.stdout.contains("Default Team: core"));
    assert!(
        out.stdout
            .contains("API URL: https://api.example.com (default)")
    );
    let saved: Value =
        serde_json::from_str(&fs::read_to_string(env.config_dir.join("config.json")).unwrap())
            .unwrap();
    assert_eq!(saved, json!({"defaultTeam": "core"}));
}

#[test]
fn an_api_url_flag_is_never_written_to_the_config_file() {
    let env = TestEnv::new("https://api.example.com");
    env.run(&[
        "--api-url",
        "https://other.example.com",
        "config:set",
        "default-team",
        "core",
    ])
    .assert_success();

    let saved: Value =
        serde_json::from_str(&fs::read_to_string(env.config_dir.join("config.json")).unwrap())
            .unwrap();
    assert_eq!(saved, json!({"defaultTeam": "core"}));
}

#[test]
fn config_set_rejects_unknown_keys_and_insecure_api_urls() {
    let env = TestEnv::new("https://api.example.com");
    let out = env.run(&["config:set", "colour", "red"]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("Unknown configuration key: colour"));

    let out = env.run(&["config:set", "api-url", "http://example.com"]);
    assert_eq!(out.code, Some(1));
    assert!(!env.config_dir.join("config.json").exists());
}

#[test]
fn skills_install_writes_once_and_then_reports_up_to_date() {
    let env = TestEnv::new("https://api.example.com");
    let target = env.work.join("skills-out");
    let target_str = target.to_str().unwrap();

    let out = env.run(&[
        "skills",
        "install",
        "--dir",
        target_str,
        "--agent",
        "claude-code",
    ]);
    out.assert_success();
    let installed = target.join("lazy-tracker-cli/SKILL.md");
    let content = fs::read_to_string(&installed).unwrap();
    let printed = env.run(&["skills"]).stdout;
    assert_eq!(Some(content.as_str()), printed.strip_suffix('\n'));

    let out = env.run(&[
        "skills",
        "install",
        "--dir",
        target_str,
        "--agent",
        "claude-code",
    ]);
    out.assert_success();
    assert!(out.stderr.contains("Skills already up to date"));
}

#[test]
fn skills_install_refuses_to_write_through_a_symlink() {
    let env = TestEnv::new("https://api.example.com");
    let target = env.work.join("skills-out");
    let skill_dir = target.join("lazy-tracker-cli");
    fs::create_dir_all(&skill_dir).unwrap();
    let victim = env.work.join("victim.txt");
    fs::write(&victim, "keep me").unwrap();
    std::os::unix::fs::symlink(&victim, skill_dir.join("SKILL.md")).unwrap();

    let out = env.run(&[
        "skills",
        "install",
        "--dir",
        target.to_str().unwrap(),
        "--agent",
        "codex",
    ]);
    assert_eq!(out.code, Some(1));
    assert!(out.stderr.contains("Refusing to write through symlink"));
    assert_eq!(fs::read_to_string(&victim).unwrap(), "keep me");
}

#[test]
fn skills_install_project_refuses_a_symlinked_directory_in_the_repository() {
    let env = TestEnv::new("https://api.example.com");
    fs::create_dir_all(env.work.join(".git")).unwrap();
    let outside = env.work.parent().unwrap().join("outside");
    fs::create_dir_all(&outside).unwrap();
    std::os::unix::fs::symlink(&outside, env.work.join(".claude")).unwrap();

    let out = env.run(&["skills", "install", "--project", "--agent", "claude-code"]);
    assert_eq!(out.code, Some(1));
    assert!(
        out.stderr
            .contains("Refusing to write through symlinked directory")
    );
    assert!(!outside.join("skills").exists());
}

#[test]
fn skills_install_without_agent_in_non_interactive_mode_fails() {
    let env = TestEnv::new("https://api.example.com");
    let out = env.run(&["skills", "install"]);
    assert_eq!(out.code, Some(1));
    assert!(
        out.stderr
            .contains("--agent is required in non-interactive mode")
    );
}

#[test]
fn skills_uninstall_removes_the_skill_directory() {
    let env = TestEnv::new("https://api.example.com");
    let target = env.work.join("skills-out");
    let target_str = target.to_str().unwrap();
    env.run(&[
        "skills", "install", "--dir", target_str, "--agent", "cursor",
    ])
    .assert_success();

    let out = env.run(&[
        "skills",
        "uninstall",
        "--dir",
        target_str,
        "--agent",
        "cursor",
        "--force",
    ]);
    out.assert_success();
    assert!(!target.join("lazy-tracker-cli").exists());
}
