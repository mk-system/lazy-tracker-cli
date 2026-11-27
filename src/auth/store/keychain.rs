use std::io::{Read, Write};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

use crate::auth::store::{ACCOUNT_NAME, TokenStore, parse_stored, serialize};
use crate::auth::token::TokenData;
use crate::error::StoreError;

// Security.framework is not called directly: the existing item's ACL trusts
// /usr/bin/security, and our ad-hoc signed binary changes identity on every
// release, so reading it in-process would raise an access prompt after each
// upgrade and fail outright in non-interactive sessions.
const SECURITY: &str = "/usr/bin/security";
// Long enough for the user to answer a Keychain unlock dialog.
const TIMEOUT: Duration = Duration::from_secs(30);
const ITEM_NOT_FOUND: i32 = 44;
// `security -i` reads commands with a 4096-byte line buffer and silently
// splits longer lines, storing a truncated password. Stay well below it.
const MAX_INTERACTIVE_LINE: usize = 4000;

pub struct KeychainStore {
    service: String,
}

impl KeychainStore {
    pub fn new(service: &str) -> Self {
        Self {
            service: service.to_owned(),
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
enum WriteCommand {
    /// One `security -i` line on stdin, keeping the token out of `ps`.
    Interactive(String),
    Argv(Vec<String>),
}

fn plan_write(service: &str, account: &str, value: &str) -> WriteCommand {
    let escaped = value.replace('\\', "\\\\").replace('"', "\\\"");
    let line = format!("add-generic-password -a {account} -s {service} -U -w \"{escaped}\"\n");
    let printable = value.chars().all(|c| c.is_ascii() && !c.is_ascii_control());
    if printable && line.len() <= MAX_INTERACTIVE_LINE {
        return WriteCommand::Interactive(line);
    }
    // Why not always stdin: an over-long line would be split and half of the
    // value stored. Passing it as an argument briefly exposes it to `ps`,
    // which is the lesser harm than corrupting the saved session.
    WriteCommand::Argv(
        [
            "add-generic-password",
            "-a",
            account,
            "-s",
            service,
            "-U",
            "-w",
            value,
        ]
        .map(str::to_owned)
        .to_vec(),
    )
}

struct Outcome {
    code: Option<i32>,
    stdout: String,
    stderr: String,
}

fn run_security(args: &[String], stdin: Option<&str>) -> Result<Outcome, String> {
    let mut child = Command::new(SECURITY)
        .args(args)
        .stdin(if stdin.is_some() {
            Stdio::piped()
        } else {
            Stdio::null()
        })
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to run {SECURITY}: {e}"))?;

    if let (Some(input), Some(mut pipe)) = (stdin, child.stdin.take()) {
        pipe.write_all(input.as_bytes())
            .map_err(|e| format!("failed to write to {SECURITY}: {e}"))?;
    }

    let mut stdout_pipe = child.stdout.take();
    let mut stderr_pipe = child.stderr.take();
    let stdout_reader = thread::spawn(move || read_all(stdout_pipe.as_mut()));
    let stderr_reader = thread::spawn(move || read_all(stderr_pipe.as_mut()));

    let started = Instant::now();
    // A normal call finishes in ~20ms, so start with short sleeps and back
    // off towards the cap only while waiting on an unlock dialog.
    let mut pause = Duration::from_millis(1);
    let status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break status,
            Ok(None) if started.elapsed() >= TIMEOUT => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(format!(
                    "timed out after {}s waiting for the Keychain (is it locked?)",
                    TIMEOUT.as_secs()
                ));
            }
            Ok(None) => {
                thread::sleep(pause);
                pause = (pause * 2).min(Duration::from_millis(50));
            }
            Err(e) => return Err(format!("failed to wait for {SECURITY}: {e}")),
        }
    };

    Ok(Outcome {
        code: status.code(),
        stdout: stdout_reader.join().unwrap_or_default(),
        stderr: stderr_reader.join().unwrap_or_default(),
    })
}

fn read_all(pipe: Option<&mut impl Read>) -> String {
    let mut text = String::new();
    if let Some(pipe) = pipe {
        let _ = pipe.read_to_string(&mut text);
    }
    text
}

fn unavailable(action: &str, detail: &str) -> StoreError {
    StoreError::Unavailable(format!(
        "Failed to {action} the macOS Keychain: {}",
        detail.trim()
    ))
}

impl TokenStore for KeychainStore {
    fn load(&self) -> Result<Option<TokenData>, StoreError> {
        let args = [
            "find-generic-password",
            "-a",
            ACCOUNT_NAME,
            "-s",
            &self.service,
            "-w",
        ]
        .map(str::to_owned);
        let outcome = run_security(&args, None).map_err(|e| unavailable("read", &e))?;
        match outcome.code {
            Some(0) => parse_stored(outcome.stdout.trim_end_matches('\n')).map(Some),
            Some(ITEM_NOT_FOUND) => Ok(None),
            _ => Err(unavailable("read", &outcome.stderr)),
        }
    }

    fn save(&self, tokens: &TokenData) -> Result<(), StoreError> {
        let value = serialize(tokens);
        let outcome = match plan_write(&self.service, ACCOUNT_NAME, &value) {
            WriteCommand::Interactive(line) => run_security(&["-i".to_owned()], Some(&line)),
            WriteCommand::Argv(args) => run_security(&args, None),
        }
        .map_err(|e| unavailable("write to", &e))?;
        match outcome.code {
            Some(0) => Ok(()),
            _ => Err(unavailable("write to", &outcome.stderr)),
        }
    }

    fn clear(&self) -> Result<(), StoreError> {
        let args = [
            "delete-generic-password",
            "-a",
            ACCOUNT_NAME,
            "-s",
            &self.service,
        ]
        .map(str::to_owned);
        let outcome = run_security(&args, None).map_err(|e| unavailable("delete from", &e))?;
        match outcome.code {
            Some(0) | Some(ITEM_NOT_FOUND) => Ok(()),
            _ => Err(unavailable("delete from", &outcome.stderr)),
        }
    }

    fn describe(&self) -> &str {
        "macOS Keychain"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_typical_token_is_written_through_stdin_with_quotes_and_backslashes_escaped() {
        let plan = plan_write("svc", "tokens", r#"{"a":"x\"y\\z"}"#);
        assert_eq!(
            plan,
            WriteCommand::Interactive(
                "add-generic-password -a tokens -s svc -U -w \"{\\\"a\\\":\\\"x\\\\\\\"y\\\\\\\\z\\\"}\"\n"
                    .to_owned()
            )
        );
    }

    #[test]
    fn a_value_too_long_for_one_interactive_line_falls_back_to_argv() {
        let value = "a".repeat(MAX_INTERACTIVE_LINE);
        assert!(matches!(
            plan_write("svc", "tokens", &value),
            WriteCommand::Argv(_)
        ));
    }

    #[test]
    fn a_value_with_control_characters_falls_back_to_argv() {
        assert!(matches!(
            plan_write("svc", "tokens", "a\nb"),
            WriteCommand::Argv(_)
        ));
    }

    #[test]
    fn the_interactive_line_never_exceeds_the_limit() {
        for len in [3900, 3930, 3950, 3990] {
            if let WriteCommand::Interactive(line) = plan_write("svc", "tokens", &"a".repeat(len)) {
                assert!(line.len() <= MAX_INTERACTIVE_LINE);
            }
        }
    }

    const SPIKE_SERVICE: &str = "lazy-tracker-cli-test";

    fn sample(len: usize) -> TokenData {
        TokenData {
            access_token: "a".repeat(len),
            refresh_token: "r\"q\\x".into(),
            expires_at: 1,
            refresh_token_expires_at: Some(2),
            scope: "read write".into(),
            api_origin: None,
        }
    }

    #[test]
    #[ignore = "touches the real login Keychain; run manually on macOS"]
    fn keychain_round_trip_overwrite_and_delete() {
        let store = KeychainStore::new(SPIKE_SERVICE);
        let _ = store.clear();
        assert_eq!(store.load().unwrap(), None);

        for len in [100, 3500, 6000] {
            store.save(&sample(len)).unwrap();
            assert_eq!(store.load().unwrap(), Some(sample(len)));
        }

        store.clear().unwrap();
        assert_eq!(store.load().unwrap(), None);
        store.clear().unwrap();
    }
}
