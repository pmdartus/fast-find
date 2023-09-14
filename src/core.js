import fs from "node:fs";

function printConsole(dirent) {
  const filename = `${dirent.path}/${dirent.name}`;
  console.log(filename);
}

function printStdout(dirent) {
  const filename = `${dirent.path}/${dirent.name}`;
  process.stdout.write(filename + "\n");
}

function isMatch(dirent, pattern) {
  return true;
  // return dirent.name.includes(pattern);
}

function readdirSync(root, cb) {
  const dirents = fs.readdirSync(root, {
    withFileTypes: true,
    recursive: true,
  });

  for (const dirent of dirents) {
    cb(dirent);
  }
}

function readdirAsync(root, cb) {
  fs.readdir(root, { withFileTypes: true, recursive: true }, (err, dirents) => {
    if (err) {
      throw err;
    }

    for (const dirent of dirents) {
      cb(dirent);
    }
  });
}

export const methods = {
  readdirSync,
  readdirAsync,
};

export function findFiles(walk, config) {
  const { pattern, root, first } = config;

  const printMatch = config.rest?.output === "stdout" ? printStdout : printConsole;

  walk(root, (dirent) => {
    if (isMatch(dirent, pattern)) {
      printMatch(dirent);

      if (first) {
        process.exit(0);
      }
    }
  });
}
