const fs = require("node:fs");

/**
 * Note: With `recursive` set to `true`, `readdir` follows symbolic links automatically.
 */

async function run(root) {
  const filenames = await fs.promises.readdir(root, { recursive: true });
  return filenames.length;
}

run(process.argv[2]).then(fileCount => {
  console.log(`Found ${fileCount} files`);
});
