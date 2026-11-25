use std::io::{self, Write};

use anstream::{AutoStream, ColorChoice};
use serde_json::Value;

/// Prints the command payload. A closed pipe (`lt tickets list | head`) is not
/// an error worth reporting, so write failures are ignored.
pub fn print_json(value: &Value) {
    let mut text = serde_json::to_string_pretty(value).unwrap_or_else(|_| "null".to_owned());
    text.push('\n');
    let mut stdout = io::stdout().lock();
    let _ = stdout.write_all(text.as_bytes());
    let _ = stdout.flush();
}

/// Prints human-readable output (tables, `config`, `auth status`) to stdout.
pub fn print_stdout(text: &str, color: ColorChoice) {
    let mut stream = AutoStream::new(io::stdout().lock(), color);
    let _ = writeln!(stream, "{text}");
    let _ = stream.flush();
}
