use std::sync::{Arc, Mutex};
use std::time::Duration;

use indicatif::{ProgressBar, ProgressDrawTarget, ProgressStyle};

#[derive(Clone, Default)]
pub struct SpinnerSlot(Arc<Mutex<Option<ProgressBar>>>);

impl SpinnerSlot {
    /// Animates only on a terminal; elsewhere the completion line printed by
    /// the caller is the only trace, so piped stderr stays line-oriented.
    pub fn start(&self, message: &str, animate: bool) {
        let mut slot = self.lock();
        if let Some(previous) = slot.take() {
            previous.finish_and_clear();
        }
        if !animate {
            return;
        }
        let bar = ProgressBar::with_draw_target(None, ProgressDrawTarget::stderr());
        bar.set_style(
            ProgressStyle::with_template("{spinner} {msg}")
                .unwrap_or_else(|_| ProgressStyle::default_spinner()),
        );
        bar.set_message(message.to_owned());
        bar.enable_steady_tick(Duration::from_millis(80));
        *slot = Some(bar);
    }

    pub fn set_message(&self, message: &str) {
        if let Some(bar) = self.lock().as_ref() {
            bar.set_message(message.to_owned());
        }
    }

    pub fn clear(&self) {
        if let Some(bar) = self.lock().take() {
            bar.finish_and_clear();
        }
    }

    pub fn suspend<R>(&self, f: impl FnOnce() -> R) -> R {
        let bar = self.lock().clone();
        match bar {
            Some(bar) => bar.suspend(f),
            None => f(),
        }
    }

    fn lock(&self) -> std::sync::MutexGuard<'_, Option<ProgressBar>> {
        self.0.lock().unwrap_or_else(|e| e.into_inner())
    }
}
