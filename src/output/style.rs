use anstyle::{AnsiColor, Style};

/// Text written by other users (ticket titles and the like) reaches a
/// terminal that would act on embedded escape sequences.
pub fn strip_controls(text: &str) -> String {
    replace_unsafe(text, |_| false)
}

pub fn strip_controls_keep_newlines(text: &str) -> String {
    replace_unsafe(text, |c| c == '\n')
}

fn replace_unsafe(text: &str, keep: impl Fn(char) -> bool) -> String {
    text.chars()
        .map(|c| if is_unsafe(c) && !keep(c) { '?' } else { c })
        .collect()
}

// ZWJ / ZWNJ (U+200C, U+200D) are left alone: emoji sequences and several
// scripts need them, and they cannot reorder or hide surrounding text.
fn is_unsafe(c: char) -> bool {
    c.is_control()
        || matches!(
            c,
            '\u{200B}'
                | '\u{200E}'
                | '\u{200F}'
                | '\u{202A}'..='\u{202E}'
                | '\u{2066}'..='\u{2069}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{FEFF}'
        )
}

fn paint(style: Style, text: &str) -> String {
    format!("{style}{text}{style:#}")
}

fn fg(color: AnsiColor) -> Style {
    Style::new().fg_color(Some(color.into()))
}

pub fn green(text: &str) -> String {
    paint(fg(AnsiColor::Green), text)
}

pub fn red(text: &str) -> String {
    paint(fg(AnsiColor::Red), text)
}

pub fn yellow(text: &str) -> String {
    paint(fg(AnsiColor::Yellow), text)
}

pub fn blue(text: &str) -> String {
    paint(fg(AnsiColor::Blue), text)
}

pub fn dim(text: &str) -> String {
    paint(Style::new().dimmed(), text)
}

pub fn bold(text: &str) -> String {
    paint(Style::new().bold(), text)
}

pub fn bold_cyan(text: &str) -> String {
    paint(fg(AnsiColor::Cyan).bold(), text)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strip_controls_replaces_escape_and_newline_but_keeps_text() {
        assert_eq!(strip_controls("ok\u{1b}[2J\nタイトル"), "ok?[2J?タイトル");
    }

    #[test]
    fn strip_controls_replaces_bidi_overrides_and_invisible_separators() {
        assert_eq!(
            strip_controls("a\u{202E}b\u{2066}c\u{200B}d\u{2028}e\u{FEFF}f"),
            "a?b?c?d?e?f"
        );
    }

    #[test]
    fn strip_controls_keeps_joiners_used_by_emoji_and_scripts() {
        let family = "👨\u{200D}👩\u{200D}👧";
        assert_eq!(strip_controls(family), family);
    }

    #[test]
    fn strip_controls_keep_newlines_keeps_only_the_newline() {
        assert_eq!(
            strip_controls_keep_newlines("line1\n\u{1b}]52;c;x\u{7}line2"),
            "line1\n?]52;c;x?line2"
        );
    }
}
