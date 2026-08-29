#!/usr/bin/env bun

import { program } from '../src/index.js';
import { error } from '../src/utils/output.js';

program.parseAsync().catch((e: unknown) => {
  error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});
