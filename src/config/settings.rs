use std::fs;
use std::io;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::config::paths::write_private_atomic;

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub api_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_team: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_project: Option<String>,
}

impl Settings {
    pub fn load(path: &Path) -> io::Result<Self> {
        match fs::read(path) {
            Ok(bytes) => serde_json::from_slice(&bytes).map_err(|e| {
                io::Error::new(
                    io::ErrorKind::InvalidData,
                    format!("Failed to parse {}: {e}", path.display()),
                )
            }),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(Self::default()),
            Err(e) => Err(e),
        }
    }

    pub fn save(&self, path: &Path) -> io::Result<()> {
        let mut json = serde_json::to_vec_pretty(self).map_err(io::Error::other)?;
        json.push(b'\n');
        write_private_atomic(path, &json)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_missing_file_reads_as_empty_settings() {
        let tmp = tempfile::tempdir().unwrap();
        let settings = Settings::load(&tmp.path().join("config.json")).unwrap();
        assert_eq!(settings, Settings::default());
    }

    #[test]
    fn settings_round_trip_with_camel_case_keys() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("config.json");
        let settings = Settings {
            api_url: Some("https://example.com".into()),
            default_team: Some("core".into()),
            default_project: None,
        };
        settings.save(&path).unwrap();

        let raw = fs::read_to_string(&path).unwrap();
        assert!(raw.contains("\"apiUrl\""));
        assert!(raw.contains("\"defaultTeam\""));
        assert!(!raw.contains("defaultProject"));
        assert_eq!(Settings::load(&path).unwrap(), settings);
    }
}
