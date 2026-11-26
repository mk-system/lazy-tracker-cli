pub mod json;
pub mod prompt;
pub mod spinner;
pub mod style;
pub mod table;

use std::io::{self, Write};
use std::sync::{Arc, Mutex};

use anstream::{AutoStream, ColorChoice};

use spinner::SpinnerSlot;

type Sink = Arc<Mutex<Box<dyn Write + Send>>>;

/// Everything that goes to stderr: status lines, spinner, prompts and debug
/// logs. stdout is reserved for command results and is written directly.
#[derive(Clone)]
pub struct Ui {
    verbose: bool,
    stdout_color: ColorChoice,
    stderr_color: ColorChoice,
    stderr_tty: bool,
    sink: Sink,
    spinner: SpinnerSlot,
}

impl Ui {
    /// `no_color` comes from `--no-color` or `NO_COLOR`. stderr's choice is
    /// settled here because the boxed sink hides the terminal from anstream,
    /// whose `Auto` would then always strip styles.
    pub fn new(verbose: bool, no_color: bool, stderr_tty: bool) -> Self {
        let (stdout_color, stderr_color) = match (no_color, stderr_tty) {
            (true, _) => (ColorChoice::Never, ColorChoice::Never),
            (false, true) => (ColorChoice::Auto, ColorChoice::Always),
            (false, false) => (ColorChoice::Auto, ColorChoice::Never),
        };
        Self {
            verbose,
            stdout_color,
            stderr_color,
            stderr_tty,
            sink: Arc::new(Mutex::new(Box::new(io::stderr()))),
            spinner: SpinnerSlot::default(),
        }
    }

    #[cfg(test)]
    pub fn capturing(verbose: bool) -> (Self, Arc<Mutex<Vec<u8>>>) {
        let buffer = Arc::new(Mutex::new(Vec::new()));
        let ui = Self {
            verbose,
            stdout_color: ColorChoice::Never,
            stderr_color: ColorChoice::Never,
            stderr_tty: false,
            sink: Arc::new(Mutex::new(Box::new(SharedBuffer(buffer.clone())))),
            spinner: SpinnerSlot::default(),
        };
        (ui, buffer)
    }

    pub fn verbose(&self) -> bool {
        self.verbose
    }

    pub fn color(&self) -> ColorChoice {
        self.stdout_color
    }

    pub fn line(&self, text: &str) {
        self.spinner.suspend(|| {
            let mut sink = self.sink.lock().unwrap_or_else(|e| e.into_inner());
            let mut stream = AutoStream::new(&mut *sink, self.stderr_color);
            let _ = writeln!(stream, "{text}");
            let _ = stream.flush();
        });
    }

    pub fn write_raw(&self, text: &str) {
        let mut sink = self.sink.lock().unwrap_or_else(|e| e.into_inner());
        let mut stream = AutoStream::new(&mut *sink, self.stderr_color);
        let _ = write!(stream, "{text}");
        let _ = stream.flush();
    }

    pub fn success(&self, message: &str) {
        self.line(&format!("{} {message}", style::green("✓")));
    }

    pub fn error(&self, message: &str) {
        self.line(&format!("{} {message}", style::red("✗")));
    }

    pub fn warn(&self, message: &str) {
        self.line(&format!("{} {message}", style::yellow("!")));
    }

    pub fn info(&self, message: &str) {
        self.line(&format!("{} {message}", style::blue("i")));
    }

    pub fn start_spinner(&self, message: &str) {
        self.spinner.start(message, self.stderr_tty);
    }

    pub fn update_spinner(&self, message: &str) {
        self.spinner.set_message(message);
    }

    pub fn succeed_spinner(&self, message: &str) {
        self.spinner.clear();
        self.success(message);
    }

    pub fn fail_spinner(&self, message: &str) {
        self.spinner.clear();
        self.error(message);
    }

    pub fn stop_spinner(&self) {
        self.spinner.clear();
    }
}

#[cfg(test)]
struct SharedBuffer(Arc<Mutex<Vec<u8>>>);

#[cfg(test)]
impl Write for SharedBuffer {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        self.0.lock().unwrap().extend_from_slice(buf);
        Ok(buf.len())
    }

    fn flush(&mut self) -> io::Result<()> {
        Ok(())
    }
}
