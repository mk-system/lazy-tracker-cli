use crate::output::{Ui, style};

const MAX_LOGGED_BODY_CHARS: usize = 2000;

impl Ui {
    pub fn debug(&self, message: &str) {
        if !self.verbose() {
            return;
        }
        self.line(&style::dim(&format!("[debug] {message}")));
    }

    // Takes method and URL only, never headers: the API client puts a Bearer
    // token in them, and a logger that cannot see a header cannot leak one.
    pub fn debug_request(&self, method: &str, url: &str) {
        self.debug(&format!("→ {method} {url}"));
    }

    pub fn debug_response(&self, method: &str, url: &str, status: u16, elapsed_ms: u128) {
        self.debug(&format!("← {status} {method} {url} ({elapsed_ms}ms)"));
    }
}

pub fn truncate_for_log(text: &str) -> String {
    match text.char_indices().nth(MAX_LOGGED_BODY_CHARS) {
        Some((cut, _)) => format!("{}… (truncated)", &text[..cut]),
        None => text.to_owned(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn captured(buffer: &std::sync::Arc<std::sync::Mutex<Vec<u8>>>) -> String {
        String::from_utf8(buffer.lock().unwrap().clone()).unwrap()
    }

    #[test]
    fn debug_writes_nothing_while_verbose_is_off() {
        let (ui, buffer) = Ui::capturing(false);
        ui.debug("hidden");
        ui.debug_request("GET", "https://api.example.com/v1/tickets");
        ui.debug_response("GET", "https://api.example.com/v1/tickets", 200, 12);

        assert_eq!(captured(&buffer), "");
    }

    #[test]
    fn debug_writes_a_prefixed_line_to_the_diagnostic_channel() {
        let (ui, buffer) = Ui::capturing(true);
        ui.debug("shown");

        assert_eq!(captured(&buffer), "[debug] shown\n");
    }

    #[test]
    fn debug_request_records_the_method_and_url() {
        let (ui, buffer) = Ui::capturing(true);
        ui.debug_request("POST", "https://api.example.com/api/v1/tickets/213/chats");

        assert_eq!(
            captured(&buffer),
            "[debug] → POST https://api.example.com/api/v1/tickets/213/chats\n"
        );
    }

    #[test]
    fn debug_response_records_the_status_and_elapsed_time() {
        let (ui, buffer) = Ui::capturing(true);
        ui.debug_response("GET", "https://api.example.com/api/v1/teams", 400, 137);

        assert_eq!(
            captured(&buffer),
            "[debug] ← 400 GET https://api.example.com/api/v1/teams (137ms)\n"
        );
    }

    #[test]
    fn truncate_for_log_leaves_text_within_the_cap_untouched() {
        assert_eq!(truncate_for_log("short body"), "short body");
    }

    #[test]
    fn truncate_for_log_caps_oversized_text_at_2000_characters() {
        let truncated = truncate_for_log(&"x".repeat(2500));

        assert!(truncated.starts_with(&"x".repeat(2000)));
        assert!(!truncated.starts_with(&"x".repeat(2001)));
        assert!(truncated.ends_with("… (truncated)"));
    }
}
