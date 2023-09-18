const fs = require("node:fs");
const path = require("node:path");

async function run(root) {
  let count = 0;
  const queue = [root];

  while (queue.length !== 0) {
    const dirname = queue.shift();

    const dirents = await fs.promises.readdir(dirname, { withFileTypes: true });
    count += dirents.length;

    for (let dirent of dirents) {
      if (dirent.isDirectory()) {
        const filename = dirname + path.sep + dirent.name;
        queue.push(filename);
      }
    }
  }

  return count;
}

run(process.argv[2]).then((fileCount) => {
  console.log(`Found ${fileCount} files`);
});
