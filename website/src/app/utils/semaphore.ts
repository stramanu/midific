export class Semaphore<T = void> {

    private waiting: Promise<T>|null = null;
    private resolve: ((value: T) => void)|null = null;

    constructor(locked = false) {
        if(locked) this.lock();
    }

    lock() {
        return this.waiting || (this.waiting = new Promise<T>(resolve => this.resolve = resolve))
    }

    wait() {
        return this.waiting || Promise.resolve();
    }

    notify(value: T) {
        if(this.resolve) {
            this.resolve(value);
            this.waiting = this.resolve = null;
        }
    }

  }
  