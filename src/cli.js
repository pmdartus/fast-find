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
      default: "readdirSync",
    }
  },
});

let [pattern, root] = positionals;
const { first, method, ...rest } = values;

if (!pattern) {
  throw new Error("No pattern specified");
}

let walk = methods[method];
if (!walk) {
  throw new Error(`Invalid method: ${method}. Available methods are: ${Object.keys(methods).join(", ")}`);
}

findFiles(walk, {
  pattern,
  root: root ?? '.',
  first,
  rest
});