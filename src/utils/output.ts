import chalk from 'chalk';
import Table from 'cli-table3';

export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function warn(message: string): void {
  console.log(chalk.yellow('!'), message);
}

export function info(message: string): void {
  console.log(chalk.blue('i'), message);
}

export function dim(message: string): void {
  console.log(chalk.dim(message));
}

// Emoji ZWJ sequences need U+200D and subdivision flags need tag characters
// (U+E0020-E007F), so both must stay out of this set.
/* eslint-disable no-control-regex */
const CONTROL_CHARS =
  /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b\u200e\u200f\u2028\u2029\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff]/g;
/* eslint-enable no-control-regex */

export function stripControlChars(text: string): string {
  return text.replace(/[\t\n\r]+/g, ' ').replace(CONTROL_CHARS, '');
}

export async function printJson(data: unknown): Promise<void> {
  // Workaround for Bun bug: chalk/ora access tty.isatty(1) at import time,
  // which causes console.log output to be truncated when stdout is piped.
  // Using process.stdout.write with drain ensures full flush before exit.
  const output = JSON.stringify(data, null, 2) + '\n';
  return new Promise<void>((resolve) => {
    if (process.stdout.write(output)) {
      resolve();
    } else {
      process.stdout.once('drain', resolve);
    }
  });
}

export interface TableColumn {
  header: string;
  key: string;
  width?: number;
  formatter?: (value: unknown) => string;
}

export function createTable(columns: TableColumn[]): Table.Table {
  const colWidths = columns.map((c) => c.width).filter((w): w is number => w !== undefined);
  return new Table({
    head: columns.map((c) => chalk.bold(c.header)),
    colWidths: colWidths.length === columns.length ? colWidths : undefined,
    style: {
      head: [],
      border: [],
    },
  });
}

export function printTable<T>(data: T[], columns: TableColumn[]): void {
  const table = createTable(columns);

  for (const row of data) {
    const rowObj = row as Record<string, unknown>;
    const values = columns.map((col) => {
      const raw = rowObj[col.key];
      const value = typeof raw === 'string' ? stripControlChars(raw) : raw;
      if (col.formatter) {
        return col.formatter(value);
      }
      return stripControlChars(String(value ?? ''));
    });
    table.push(values);
  }

  console.log(table.toString());
}

export function formatState(state: string): string {
  const stateColors: Record<string, (s: string) => string> = {
    created: chalk.gray,
    started: chalk.cyan,
    finished: chalk.blue,
    delivered: chalk.yellow,
    accepted: chalk.green,
    rejected: chalk.red,
  };
  const colorFn = stateColors[state] || chalk.white;
  return colorFn(state);
}

export function formatTicketType(type: string): string {
  const typeColors: Record<string, (s: string) => string> = {
    normal: chalk.white,
    bug: chalk.red,
    chore: chalk.gray,
    release: chalk.magenta,
  };
  const colorFn = typeColors[type] || chalk.white;
  return colorFn(type);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
