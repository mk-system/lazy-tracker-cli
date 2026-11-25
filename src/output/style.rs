use anstyle::{AnsiColor, Style};

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
