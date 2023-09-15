export class AsyncQueue {
    #fn = null;
    #concurrency = 1;

    #queue = [];
    #running = 0;

    constructor(fn, concurrency = 1) {
        this.#fn = fn;
        this.#concurrency = concurrency;
    }
    
    enqueue(...item) {
        this.#queue.push(...item);
        if (this.#running < this.#concurrency) {
            this.#runNext();
        }
    }
    
    get size() {
        return this.#queue.length;
    }

    get isEmpty() {
        return this.#queue.length === 0;
    }

    get isIdle() {
        return this.#queue.length === 0 && this.#running === 0;
    }

    #runNext() {
        const item = this.#queue.shift();
        this.#running += 1;

        const promise = this.#fn(item);
        promise.then(() => {
            this.#running -= 1;
            if (this.#queue.length > 0) {
                this.#runNext();
            }
        });
    }
}