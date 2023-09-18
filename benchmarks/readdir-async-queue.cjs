const fs = require("node:fs");
const path = require("node:path");

const CONCURRENCY = parseInt(process.env.UV_THREADPOOL_SIZE ?? "4", 10);

class AsyncQueue {
  constructor(fn, config) {
    this.fn = fn;
    this.concurrency = config.concurrency ?? Infinity;

    this.queue = [];
    this.running = 0;
  }

  enqueue(item) {
    this.queue.push(item);
    this.process();
  }

  process() {
    while (this.running <= this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift();

      this.fn(item).then(() => {
        this.running -= 1;
        this.process();
      });

      this.running += 1;
    }

    if (this.isIdle()) {
      this.onDrain();
    }
  }

  isIdle() {
    return this.running === 0 && this.queue.length === 0;
  }

  onDrain() {
    // To be overridden
  }
}

async function run(root) {
  let count = 0;

  const queue = new AsyncQueue(async (filename) => {
    const dirents = await fs.promises.readdir(filename, { withFileTypes: true });
    count += dirents.length;

    for (let dirent of dirents) {
      if (dirent.isDirectory()) {
        const filename = dirent.path + path.sep + dirent.name;
        queue.enqueue(filename);
      }
    }
  }, {
    concurrency: CONCURRENCY
  });

  return new Promise((resolve) => {
    queue.onDrain = () => {
      resolve(count);
    };

    queue.enqueue(root);
  });
}

run(process.argv[2]).then((fileCount) => {
  console.log(`Found ${fileCount} files`);
});
