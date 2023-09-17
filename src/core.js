import fs from "node:fs";

import { AsyncQueue } from './async-queue.js';

function printMatch(dirent) {
  const filename = `${dirent.path}/${dirent.name}`;
  process.stdout.write(filename + "\n");
}

function isMatch(dirent, pattern) {
  return true;
  // return dirent.name.includes(pattern);
}

function walkAsyncQueue(root, config, cb) {
  const queue = new AsyncQueue(async (filename) => {
    const dirents = await fs.promises.readdir(filename, { withFileTypes: true });

    for (let dirent of dirents) {
      if (dirent.isDirectory()) {
        queue.enqueue(`${dirent.path}/${dirent.name}`);
      }
    }

    cb(dirents);
  }, config.concurrency);

  queue.enqueue(root);
}

export function findFiles(config) {
  const { pattern, root, first } = config;

  walkAsyncQueue(root, config, (dirents) => {
    for (let dirent of dirents) {
      if (isMatch(dirent, pattern)) {
        printMatch(dirent);

        if (first) {
          process.exit(0);
        }
      }
    }
  });
}
