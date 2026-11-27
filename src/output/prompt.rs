use std::io::{self, BufRead};

use crate::error::CliError;
use crate::output::Ui;

pub fn ask(ui: &Ui, prompt: &str) -> Result<Option<String>, CliError> {
    ui.stop_spinner();
    ui.write_raw(prompt);
    let mut answer = String::new();
    let read = io::stdin().lock().read_line(&mut answer)?;
    if read == 0 {
        return Ok(None);
    }
    Ok(Some(answer.trim().to_owned()))
}

pub fn confirm(ui: &Ui, stdin_tty: bool, message: &str) -> Result<bool, CliError> {
    ensure_can_confirm(stdin_tty)?;
    let answer = ask(ui, &format!("{message} (y/N): "))?.unwrap_or_default();
    Ok(is_yes(&answer))
}

pub fn ensure_can_confirm(stdin_tty: bool) -> Result<(), CliError> {
    if stdin_tty {
        return Ok(());
    }
    Err(CliError::usage(
        "Confirmation required but stdin is not a terminal. Re-run with --force to skip the prompt.",
    ))
}

fn is_yes(answer: &str) -> bool {
    matches!(answer.to_lowercase().as_str(), "y" | "yes")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_y_or_yes_in_any_case_confirms() {
        assert!(is_yes("y"));
        assert!(is_yes("YES"));
        assert!(!is_yes(""));
        assert!(!is_yes("n"));
        assert!(!is_yes("yeah"));
    }

    #[test]
    fn confirmation_without_a_terminal_fails_with_force_guidance() {
        let (ui, _) = Ui::capturing(false);
        let err = confirm(&ui, false, "Delete?").unwrap_err();
        assert!(err.to_string().contains("--force"));
    }
}
