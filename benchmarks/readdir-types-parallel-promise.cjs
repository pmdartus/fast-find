const fs = require("node:fs");
const path = require("node:path");

async function run(dirname) {
  const dirents = await fs.promises.readdir(dirname, { withFileTypes: true });
  const subdirCounts = await Promise.all(
    dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        const filename = dirent.path + path.sep + dirent.name;
        return run(filename);
      })
  );

  return subdirCounts.reduce((acc, count) => acc + count, dirents.length);
}

run(process.argv[2]).then((fileCount) => {
  console.log(`Found ${fileCount} files`);
});
