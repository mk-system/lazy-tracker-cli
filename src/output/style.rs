use anstyle::{AnsiColor, Style};

/// Text written by other users (ticket titles and the like) reaches a
/// terminal that would act on embedded escape sequences.
pub fn strip_controls(text: &str) -> String {
    text.chars()
        .map(|c| if c.is_control() { '?' } else { c })
        .collect()
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
}
