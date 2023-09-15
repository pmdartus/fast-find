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

function readdirSync(root, config, cb) {
  const dirents = fs.readdirSync(root, {
    withFileTypes: true,
    recursive: true,
  });

  cb(dirents);
}

function readdirAsync(root, config, cb) {
  fs.readdir(root, { withFileTypes: true, recursive: true }, (err, dirents) => {
    if (err) {
      throw err;
    }

    cb(dirents);
  });
}

async function walkAsyncSerial(root, config, cb) {
  const queue = [root];

  while (queue.length !== 0) {
    const root = queue.shift();

    const dirents = await fs.promises.readdir(root, { withFileTypes: true });

    for (let dirent of dirents) {
      if (dirent.isDirectory()) {
        queue.push(`${root}/${dirent.name}`);
      }
    }

    cb(dirents);
  }
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

export const methods = {
  readdirSync,
  readdirAsync,
  walkAsyncSerial,
  walkAsyncQueue,
};

export function findFiles(walk, config) {
  const { pattern, root, first } = config;

  walk(root, config, (dirents) => {
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
