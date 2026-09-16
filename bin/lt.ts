#!/usr/bin/env bun

import { program } from '../src/index.js';
import { error } from '../src/utils/output.js';
import { formatError } from '../src/utils/errors.js';

program.parseAsync().catch((e: unknown) => {
  error(formatError(e));
  process.exitCode = 1;
});
