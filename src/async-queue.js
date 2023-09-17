import { LinkedList } from "./linked-list.js";

export class AsyncQueue {
  fn = null;
  queue = new LinkedList();

  concurrency;
  running = 0;

  constructor(fn, concurrency) {
    this.fn = fn;
    this.concurrency = concurrency;
  }

  enqueue(item) {
    this.queue.add(item);
    this.process();
  }

  get size() {
    return this.queue.size;
  }

  get isEmpty() {
    return this.size === 0;
  }

  get isIdle() {
    return this.size === 0 && this.running === 0;
  }

  process() {
    while (this.running < this.concurrency && !this.queue.isEmpty) {
      const item = this.queue.remove();

      this.fn(item).then(() => {
        this.running -= 1;
        this.process();
      });

      this.running += 1;
    }
  }
}
