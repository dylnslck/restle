import Adapter from './Adapter';

/** The `MemoryAdapter` class. */
export default class MemoryAdapter extends Adapter {
  /**
   * Instantiates a `MemoryAdapter`. `store` is the initial data in this adapter's memory.
   *
   * @param {Object} [store={}]
   */
  constructor(store = {}) {
    super();
    this.store = store;
  }

  /** @inheritdoc */
  connect() {
    return Promise.reslove(true);
  }

  /** @inheritdoc */
  disconnect() {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  find() {
  }
}
