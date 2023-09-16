#!/usr/bin/env node
import { parseArgs } from "node:util";

import { findFiles, methods } from "./core.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    first: {
      type: "boolean",
      short: "f",
      default: false,
    },
    method: {
      type: "string",
      default: "walkAsyncQueue",
    },
    concurrency: {
      type: "string",
      default: '4',
    },
  },
});

let [pattern, root] = positionals;
const { first, method, concurrency, ...rest } = values;

if (!pattern) {
  throw new Error("No pattern specified");
}

let walk = methods[method];
if (!walk) {
  throw new Error(`Invalid method: ${method}. Available methods are: ${Object.keys(methods).join(", ")}`);
}

findFiles(walk, {
  pattern,
  first,
  root: root ?? '.',
  concurrency: parseInt(concurrency, 10),
  rest
});