import ora, { type Ora } from 'ora';

let currentSpinner: Ora | null = null;

export function startSpinner(text: string): Ora {
  if (currentSpinner) {
    currentSpinner.stop();
  }
  currentSpinner = ora(text).start();
  return currentSpinner;
}

export function stopSpinner(spinner?: Ora): void {
  const s = spinner || currentSpinner;
  if (s) {
    s.stop();
    if (s === currentSpinner) {
      currentSpinner = null;
    }
  }
}

export function succeedSpinner(text: string, spinner?: Ora): void {
  const s = spinner || currentSpinner;
  if (s) {
    s.succeed(text);
    if (s === currentSpinner) {
      currentSpinner = null;
    }
  }
}

export function failSpinner(text: string, spinner?: Ora): void {
  const s = spinner || currentSpinner;
  if (s) {
    s.fail(text);
    if (s === currentSpinner) {
      currentSpinner = null;
    }
  }
}

export function updateSpinner(text: string, spinner?: Ora): void {
  const s = spinner || currentSpinner;
  if (s) {
    s.text = text;
  }
}
