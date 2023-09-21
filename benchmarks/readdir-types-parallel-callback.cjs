const fs = require("node:fs");
const path = require("node:path");

function asyncMap(items, fn, cb) {
  let result = new Array(items.length);
  let running = items.length;
  let failed = false;

  if (items.length === 0) {
    cb(null, result);
  }

  for (let i = 0; i < items.length; i++) {
    const index = i;
    const item = items[index];
    fn(item, (err, res) => {
      if (failed) {
        return;
      }

      if (err) {
        failed = true;
        return cb(err);
      }

      result[index] = res;
      running--;

      if (running === 0) {
        cb(null, result);
      }
    });
  }
}

function runCallback(dirname, cb) {
  fs.readdir(dirname, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      return cb(err);
    }

    const directories = dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.path + path.sep + dirent.name);

    asyncMap(directories, runCallback, (err, subdirCounts) => {
      if (err) {
        return cb(err);
      }

      const totalCount = subdirCounts.reduce(
        (acc, count) => acc + count,
        dirents.length
      );
      cb(null, totalCount);
    });
  });
}

async function run(dirname) {
  return new Promise((resolve, reject) => {
    runCallback(dirname, (err, count) => {
      if (err) {
        return reject(err);
      }
      resolve(count);
    });
  });
}

run(process.argv[2]).then((fileCount) => {
  console.log(`Found ${fileCount} files`);
}).catch(err => {
  console.error(err);
});
