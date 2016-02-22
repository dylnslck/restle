/* eslint no-param-reassign: 1 */

import Adapter from './Adapter';
import { AdapterError } from './Errors.js';
import deepClone from './utils/deepClone';
import didFilterPass from './utils/didFilterPass';

/** The `MemoryAdapter` class. */
export default class MemoryAdapter extends Adapter {
  /**
   * Instantiates a `MemoryAdapter`. `store` is the initial data in this adapter's memory.
   *
   * @param {Object} [store={}]
   */
  constructor(store = {}) {
    super();
    if (!Object.keys(store).map(key => store[key]).every(Array.isArray)) throw new AdapterError();
    this.store = store;
  }

  /** @inheritdoc */
  connect() {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  disconnect() {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  find(type, include = [], options = {}) {
    const store = this.store;

    // if (!(type in store)) throw new AdapterError();

    const { ids, filter, fields, page } = options;
    let records = deepClone(store[type]);

    // filter by ids
    if (ids) {
      if (!Array.isArray(ids)) throw new Error();

      records = records.filter(record => ids.includes(record.id));
    }

    // filter by ids and operators
    records = records.filter(record => didFilterPass(record, filter));

    // exclude fields
    if (fields) {
      records = records.map(record => {
        Object.keys(fields).forEach(key => {
          if (!fields[key]) delete record[key];
        });
        return record;
      });
    }


    const count = records.length;

    // paginate
    if (page) {
      const { offset, limit } = page;

      records = records.slice(
        offset || 0,
        offset || 0 + (limit || count)
      );
    }

    // sort

    // populate

    return Promise.resolve(records);
  }
}
