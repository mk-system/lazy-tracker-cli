use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

pub const EXPIRY_BUFFER_MS: u64 = 60 * 1000;

/// Serialized as camelCase JSON, the same shape the Bun release stored in the
/// Keychain, so upgrading does not force a new login.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenData {
    pub access_token: String,
    pub refresh_token: String,
    /// Epoch milliseconds.
    pub expires_at: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub refresh_token_expires_at: Option<u64>,
    #[serde(default)]
    pub scope: String,
    /// Origin of the API that issued the tokens. Absent in tokens saved before
    /// this field existed, which are then accepted for any API URL.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub api_origin: Option<String>,
}

impl TokenData {
    pub fn is_expired(&self, now_ms: u64) -> bool {
        now_ms >= self.expires_at.saturating_sub(EXPIRY_BUFFER_MS)
    }

    pub fn is_refresh_expired(&self, now_ms: u64) -> bool {
        self.refresh_token_expires_at.is_some_and(|at| now_ms >= at)
    }
}

#[derive(Debug, Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    #[serde(default)]
    pub refresh_token: Option<String>,
    pub expires_in: u64,
    #[serde(default)]
    pub refresh_token_expires_in: Option<u64>,
    #[serde(default)]
    pub scope: Option<String>,
}

impl TokenResponse {
    /// A server that does not rotate refresh tokens omits `refresh_token`;
    /// the one used for the request then stays valid.
    pub fn into_token_data(
        self,
        now_ms: u64,
        previous_refresh: Option<&str>,
        api_origin: Option<String>,
    ) -> Option<TokenData> {
        let refresh_token = self
            .refresh_token
            .filter(|t| !t.is_empty())
            .or_else(|| previous_refresh.map(str::to_owned))?;
        Some(TokenData {
            access_token: self.access_token,
            refresh_token,
            expires_at: after_secs(now_ms, self.expires_in),
            refresh_token_expires_at: self
                .refresh_token_expires_in
                .filter(|secs| *secs > 0)
                .map(|secs| after_secs(now_ms, secs)),
            scope: self.scope.unwrap_or_default(),
            api_origin,
        })
    }
}

fn after_secs(now_ms: u64, secs: u64) -> u64 {
    now_ms.saturating_add(secs.saturating_mul(1000))
}

pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn token(expires_at: u64) -> TokenData {
        TokenData {
            access_token: "a".into(),
            refresh_token: "r".into(),
            expires_at,
            refresh_token_expires_at: None,
            scope: "read write".into(),
            api_origin: None,
        }
    }

    #[test]
    fn a_token_counts_as_expired_one_minute_early() {
        let t = token(1_000_000);
        assert!(!t.is_expired(1_000_000 - EXPIRY_BUFFER_MS - 1));
        assert!(t.is_expired(1_000_000 - EXPIRY_BUFFER_MS));
    }

    #[test]
    fn the_stored_json_matches_the_bun_release_format() {
        let json = r#"{"accessToken":"a","refreshToken":"r","expiresAt":5,"refreshTokenExpiresAt":9,"scope":"read write"}"#;
        let parsed: TokenData = serde_json::from_str(json).unwrap();
        assert_eq!(parsed.refresh_token_expires_at, Some(9));
        assert_eq!(serde_json::to_string(&parsed).unwrap(), json);
    }

    #[test]
    fn zero_or_missing_refresh_expiry_means_no_refresh_expiry() {
        let response: TokenResponse = serde_json::from_str(
            r#"{"access_token":"a","refresh_token":"r","expires_in":60,"refresh_token_expires_in":0,"scope":"s"}"#,
        )
        .unwrap();
        let data = response.into_token_data(1000, None, None).unwrap();
        assert_eq!(data.expires_at, 61_000);
        assert_eq!(data.refresh_token_expires_at, None);
    }

    #[test]
    fn an_unrotated_refresh_token_is_kept() {
        let response: TokenResponse =
            serde_json::from_str(r#"{"access_token":"a","expires_in":60}"#).unwrap();
        let data = response
            .into_token_data(0, Some("old-refresh"), None)
            .unwrap();
        assert_eq!(data.refresh_token, "old-refresh");
    }

    #[test]
    fn a_response_without_any_refresh_token_is_not_turned_into_tokens() {
        let missing: TokenResponse =
            serde_json::from_str(r#"{"access_token":"a","expires_in":60}"#).unwrap();
        let empty: TokenResponse =
            serde_json::from_str(r#"{"access_token":"a","refresh_token":"","expires_in":60}"#)
                .unwrap();
        assert!(missing.into_token_data(0, None, None).is_none());
        assert!(empty.into_token_data(0, None, None).is_none());
    }

    #[test]
    fn huge_lifetimes_from_the_server_saturate_instead_of_wrapping() {
        let response: TokenResponse = serde_json::from_str(&format!(
            r#"{{"access_token":"a","refresh_token":"r","expires_in":{max},"refresh_token_expires_in":{max}}}"#,
            max = u64::MAX
        ))
        .unwrap();
        let data = response.into_token_data(5, None, None).unwrap();
        assert_eq!(data.expires_at, u64::MAX);
        assert_eq!(data.refresh_token_expires_at, Some(u64::MAX));
        assert!(!data.is_expired(now_ms()));
    }
}
