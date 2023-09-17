#!/usr/bin/env node

const os = require("node:os");
const { parseArgs } = require('node:util');

const { positionals, values } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    first: {
      type: "boolean",
      short: "f",
      default: false,
    },
    concurrency: {
      type: "string",
      default: String(os.cpus().length),
    },
  },
});

let [pattern, root] = positionals;
const { first, concurrency } = values;

if (!pattern) {
  throw new Error("No pattern specified");
}

// Using a CommonJS entry point to dynamically set the libuv worker pool size to the number of
// logical CPUs. Don't override worker pool size if already set using an environment variable.
process.env.UV_THREADPOOL_SIZE = concurrency;

import("../src/core.js").then((mod) => {
  mod.findFiles({
    ...values,
    root: root ?? ".",
    concurrency: parseInt(concurrency, 10),
  });
});
