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

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
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
      const value = rowObj[col.key];
      if (col.formatter) {
        return col.formatter(value);
      }
      return String(value ?? '');
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
