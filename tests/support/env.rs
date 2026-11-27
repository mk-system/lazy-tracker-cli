//! Every integration test starts `lt` through `TestEnv`, which points all
//! state at a temp dir and the plaintext token file, so `cargo test` never
//! touches the developer's Keychain, Secret Service or config directory.
#![allow(dead_code)]

use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use serde_json::Value;
use tempfile::TempDir;

pub const BIN: &str = env!("CARGO_BIN_EXE_lt");

pub struct TestEnv {
    _root: TempDir,
    pub home: PathBuf,
    pub config_dir: PathBuf,
    pub work: PathBuf,
    api_url: String,
}

impl TestEnv {
    pub fn new(api_url: &str) -> Self {
        let root = tempfile::tempdir().expect("temp dir");
        let base = root.path().canonicalize().expect("canonical temp dir");
        let home = base.join("home");
        let config_dir = base.join("config");
        let work = base.join("work");
        for dir in [&home, &work, &base.join("xdg")] {
            fs::create_dir_all(dir).unwrap();
        }
        Self {
            _root: root,
            home,
            config_dir,
            work,
            api_url: api_url.to_owned(),
        }
    }

    pub fn command(&self) -> Command {
        let mut cmd = Command::new(BIN);
        cmd.env_clear()
            .env("PATH", "/usr/bin:/bin")
            .env("HOME", &self.home)
            .env("XDG_CONFIG_HOME", self.home.parent().unwrap().join("xdg"))
            .env("LT_CONFIG_DIR", &self.config_dir)
            .env("LT_INSECURE_TOKEN_FILE", "1")
            .env("LT_NO_BROWSER", "1")
            .env("LT_API_URL", &self.api_url)
            .env("NO_COLOR", "1")
            .current_dir(&self.work)
            .stdin(Stdio::null());
        cmd
    }

    pub fn run(&self, args: &[&str]) -> Outcome {
        let output = self.command().args(args).output().expect("run lt");
        Outcome::from(output)
    }

    pub fn tokens_path(&self) -> PathBuf {
        self.config_dir.join("tokens.json")
    }

    pub fn write_tokens(&self, refresh_token: &str, expires_at: u64) {
        fs::create_dir_all(&self.config_dir).unwrap();
        let origin = url::Url::parse(&self.api_url)
            .map(|u| u.origin().ascii_serialization())
            .unwrap_or_default();
        let tokens = serde_json::json!({
            "accessToken": format!("access-for-{refresh_token}"),
            "refreshToken": refresh_token,
            "expiresAt": expires_at,
            "scope": "read write",
            "apiOrigin": origin,
        });
        self.write_raw_tokens(&tokens.to_string());
    }

    /// Owner-only, like the files lt writes itself.
    pub fn write_raw_tokens(&self, raw: &str) {
        use std::os::unix::fs::OpenOptionsExt;
        fs::create_dir_all(&self.config_dir).unwrap();
        let _ = fs::remove_file(self.tokens_path());
        let mut file = fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .mode(0o600)
            .open(self.tokens_path())
            .unwrap();
        std::io::Write::write_all(&mut file, raw.as_bytes()).unwrap();
    }

    pub fn tokens(&self) -> Option<Value> {
        let raw = fs::read_to_string(self.tokens_path()).ok()?;
        serde_json::from_str(&raw).ok()
    }
}

pub struct Outcome {
    pub code: Option<i32>,
    pub stdout: String,
    pub stderr: String,
}

impl Outcome {
    pub fn json(&self) -> Value {
        serde_json::from_str(&self.stdout)
            .unwrap_or_else(|e| panic!("stdout is not JSON ({e}):\n{}", self.stdout))
    }

    #[track_caller]
    pub fn assert_success(&self) -> &Self {
        assert_eq!(self.code, Some(0), "stderr:\n{}", self.stderr);
        self
    }
}

impl From<std::process::Output> for Outcome {
    fn from(output: std::process::Output) -> Self {
        Self {
            code: output.status.code(),
            stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
            stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
        }
    }
}
