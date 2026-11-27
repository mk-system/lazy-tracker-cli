use url::{Host, Url};

pub const DEFAULT_API_URL: &str = "https://api.lazy-tracker.com";

/// The API URL is where the bearer token is sent, so every source of it goes
/// through the same check: https only, plus http for loopback hosts (local
/// backends and tests).
pub fn validate(raw: &str) -> Result<String, String> {
    let parsed = Url::parse(raw).map_err(|_| "Invalid API URL: must be a valid URL".to_owned())?;
    if parsed.cannot_be_a_base() || parsed.host().is_none() {
        return Err("Invalid API URL: must be a valid URL".to_owned());
    }
    match parsed.scheme() {
        "https" => {}
        "http" if is_loopback(&parsed) => {}
        _ => {
            return Err(
                "Invalid API URL: only https:// is allowed (http:// only for localhost)".to_owned(),
            );
        }
    }
    Ok(raw.trim_end_matches('/').to_owned())
}

/// The backend serves the verification page from the API host itself, so a
/// URL pointing anywhere else is treated as a phishing attempt.
///
/// Returns the serialized URL, which percent-encodes the control characters
/// the server may have put in it; show and open that, never `raw`.
pub fn safe_url_to_open(raw: &str, api_url: &str) -> Option<String> {
    let (Ok(target), Ok(api)) = (Url::parse(raw), Url::parse(api_url)) else {
        return None;
    };
    (validate(raw).is_ok() && target.origin() == api.origin()).then(|| target.into())
}

pub fn origin_of(url: &str) -> Option<String> {
    Url::parse(url)
        .ok()
        .map(|u| u.origin().ascii_serialization())
}

fn is_loopback(url: &Url) -> bool {
    match url.host() {
        Some(Host::Domain(domain)) => domain.eq_ignore_ascii_case("localhost"),
        Some(Host::Ipv4(ip)) => ip == std::net::Ipv4Addr::LOCALHOST,
        Some(Host::Ipv6(ip)) => ip == std::net::Ipv6Addr::LOCALHOST,
        None => false,
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Source {
    Flag,
    Settings,
    Env,
    Default,
}

/// `--api-url` > `config.json` > `LT_API_URL` > default. The winner is
/// validated whichever source it came from.
pub fn resolve(
    flag: Option<&str>,
    settings: Option<&str>,
    env: Option<&str>,
) -> (Source, Result<String, String>) {
    let (source, raw) = [
        (Source::Flag, flag),
        (Source::Settings, settings),
        (Source::Env, env),
    ]
    .into_iter()
    .find_map(|(source, value)| value.filter(|v| !v.is_empty()).map(|v| (source, v)))
    .unwrap_or((Source::Default, DEFAULT_API_URL));
    (source, validate(raw))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_urls_on_the_api_origin_are_safe_to_open() {
        let api = "https://api.lazy-tracker.com";
        assert_eq!(
            safe_url_to_open("https://api.lazy-tracker.com/oauth/device?user_code=A", api)
                .as_deref(),
            Some("https://api.lazy-tracker.com/oauth/device?user_code=A")
        );
        assert!(safe_url_to_open("https://evil.example/oauth/device", api).is_none());
        assert!(safe_url_to_open("https://api.lazy-tracker.com:8443/oauth/device", api).is_none());
        assert!(safe_url_to_open("http://api.lazy-tracker.com/oauth/device", api).is_none());
        assert!(safe_url_to_open("file:///etc/passwd", api).is_none());
    }

    #[test]
    fn a_url_safe_to_open_carries_no_raw_control_characters() {
        let api = "https://api.lazy-tracker.com";
        let opened = safe_url_to_open(
            "https://api.lazy-tracker.com/oauth/\u{1b}[2Jdevice?c=\u{202E}x#\u{7}",
            api,
        )
        .unwrap();

        assert!(!opened.chars().any(|c| c.is_control() || !c.is_ascii()));
        assert!(opened.starts_with("https://api.lazy-tracker.com/oauth/%1B[2Jdevice"));
    }

    #[test]
    fn plain_http_to_a_remote_host_is_rejected() {
        assert!(validate("http://example.com").is_err());
    }

    #[test]
    fn https_is_accepted_without_a_trailing_slash() {
        assert_eq!(
            validate("https://api.example.com/").unwrap(),
            "https://api.example.com"
        );
    }

    #[test]
    fn http_to_loopback_is_accepted() {
        assert!(validate("http://127.0.0.1:8080").is_ok());
        assert!(validate("http://localhost:8080").is_ok());
        assert!(validate("http://[::1]:8080").is_ok());
    }

    #[test]
    fn http_to_a_host_that_merely_starts_with_localhost_is_rejected() {
        assert!(validate("http://localhost.evil.example").is_err());
        assert!(validate("http://127.0.0.2").is_err());
    }

    #[test]
    fn non_url_and_non_http_schemes_are_rejected() {
        assert!(validate("not a url").is_err());
        assert!(validate("file:///etc/passwd").is_err());
        assert!(validate("javascript:alert(1)").is_err());
    }

    #[test]
    fn flag_wins_over_settings_env_and_default() {
        let (source, url) = resolve(
            Some("https://flag.example"),
            Some("https://settings.example"),
            Some("https://env.example"),
        );
        assert_eq!(source, Source::Flag);
        assert_eq!(url.unwrap(), "https://flag.example");
    }

    #[test]
    fn settings_win_over_env() {
        let (source, _) = resolve(
            None,
            Some("https://settings.example"),
            Some("https://env.example"),
        );
        assert_eq!(source, Source::Settings);
    }

    #[test]
    fn lt_api_url_is_held_to_the_same_rule() {
        let (source, url) = resolve(None, None, Some("http://example.com"));
        assert_eq!(source, Source::Env);
        assert!(url.is_err());
    }

    #[test]
    fn default_applies_when_nothing_is_set() {
        let (source, url) = resolve(None, None, Some(""));
        assert_eq!(source, Source::Default);
        assert_eq!(url.unwrap(), DEFAULT_API_URL);
    }
}
