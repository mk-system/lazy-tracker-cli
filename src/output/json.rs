use std::io::{self, Write};

use anstream::{AutoStream, ColorChoice};
use serde_json::Value;

pub fn print_json(value: &Value) {
    let mut text = serde_json::to_string_pretty(value).unwrap_or_else(|_| "null".to_owned());
    text.push('\n');
    let mut stdout = io::stdout().lock();
    // stdout may be a closed pipe (`lt ... | head`); the write error is expected.
    let _ = stdout.write_all(text.as_bytes());
    let _ = stdout.flush();
}

pub fn print_stdout(text: &str, color: ColorChoice) {
    let mut stream = AutoStream::new(io::stdout().lock(), color);
    let _ = writeln!(stream, "{text}");
    let _ = stream.flush();
}
