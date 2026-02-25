import ora, { type Ora } from 'ora';

const state: { current: Ora | null } = { current: null };

export function startSpinner(text: string): Ora {
  if (state.current) {
    state.current.stop();
  }
  state.current = ora(text).start();
  return state.current;
}

export function stopSpinner(spinner?: Ora): void {
  const s = spinner || state.current;
  if (s) {
    s.stop();
    if (s === state.current) {
      state.current = null;
    }
  }
}

export function succeedSpinner(text: string, spinner?: Ora): void {
  const s = spinner || state.current;
  if (s) {
    s.succeed(text);
    if (s === state.current) {
      state.current = null;
    }
  }
}

export function failSpinner(text: string, spinner?: Ora): void {
  const s = spinner || state.current;
  if (s) {
    s.fail(text);
    if (s === state.current) {
      state.current = null;
    }
  }
}

export function updateSpinner(text: string, spinner?: Ora): void {
  const s = spinner || state.current;
  if (s) {
    s.text = text;
  }
}
