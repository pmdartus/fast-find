#!/usr/bin/env node

// Using a CommonJS entry point to dynamically set the libuv worker pool size to the number of
// logical CPUs. Don't override worker pool size if already set using an environment variable.
const os = require("node:os");
process.env.UV_THREADPOOL_SIZE ??= os.cpus().length;

import("../src/cli.js").then((cli) => {
  cli.run();
});
