const fs = require("node:fs");
const path = require("node:path");

async function run(root) {
  let count = 0;
  const queue = [root];

  while (queue.length !== 0) {
    const dirname = queue.shift();

    const filenames = await fs.promises.readdir(dirname);
    count += filenames.length;

    for (let filename of filenames) {
      const filepath = dirname + path.sep + filename;
      const stat = await fs.promises.lstat(filepath);

      if (stat.isDirectory()) {
        queue.push(filepath);
      }
    }
  }

  return count;
}

run(process.argv[2]).then((fileCount) => {
  console.log(`Found ${fileCount} files`);
});
