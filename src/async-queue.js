import { LinkedList } from "./linked-list.js";

export class AsyncQueue {
  fn = null;
  queue = new LinkedList();

  concurrency = 1;
  running = 0;
  isScheduled = false;

  constructor(fn, concurrency = 1) {
    this.fn = fn;
    this.concurrency = concurrency;
  }

  enqueue(item) {
    this.queue.add(item);
    this.scheduleNext();
  }

  scheduleNext() {
    if (this.isScheduled) {
      return;
    }

    this.isScheduled = true;

    process.nextTick(() => {
      this.isScheduled = false;
      this.next();
    });
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

  next() {
    while (this.running < this.concurrency && !this.queue.isEmpty) {
      const item = this.queue.remove();

      this.fn(item).then(() => {
        this.running -= 1;
        this.scheduleNext();
      });

      this.running += 1;
    }
  }
}
