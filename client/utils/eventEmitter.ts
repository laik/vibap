// Custom event emitter

interface Options {
  once?: boolean; // call once and remove
  prepend?: boolean; // put listener to the beginning
}

type Callback<D extends [...any[]]> = (...data: D) => void | boolean;

export class EventEmitter<D extends [...any[]]> {
  protected listeners: [Callback<D>, Options][] = [];

  addListener(callback: Callback<D>, options: Options = {}) {
    const fn = options.prepend ? 'unshift' : 'push';

    this.listeners[fn]([callback, options]);
  }

  removeListener(callback: Callback<D>) {
    this.listeners = this.listeners.filter(([cb]) => cb !== callback);
  }

  removeAllListeners() {
    this.listeners.length = 0;
  }

  length(): number {
    return this.listeners.length;
  }

  emit(...data: D) {
    [...this.listeners].every(([callback, options]) => {
      if (options.once) this.removeListener(callback);
      const result = callback(...data);
      if (result === false) return; // break cycle
      return true;
    })
  }
}
