/* eslint no-param-reassign: 1 */

import { AdapterError } from './Errors.js';
import Adapter from './Adapter';
import deepClone from './utils/deepClone';
import didFilterPass from './utils/didFilterPass';

function compare(order, x, y) {
  const type = typeof x === typeof y
    ? typeof x
    : false;

  // can't compare different types
  if (!type) return 0;

  if (order === 'asc') return x > y ? 1 : -1;
  else if (order === 'desc') return x < y ? 1 : -1;

  // default is asc
  return 1;
}

/** The `MemoryAdapter` class. */
export default class MemoryAdapter extends Adapter {
  /**
   * Instantiates a `MemoryAdapter`. `store` is the initial data in this adapter's memory.
   *
   * @param {Object} schemas
   * @param {Object} [store={}]
   */
  constructor(schemas, store = {}) {
    super();

    if (!Object.keys(store).map(key => store[key]).every(Array.isArray)) throw new AdapterError();

    this.schemas = schemas;
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

  retrieve(type, ids = []) {
    const records = this.store[type] || [];

    return records.find(record => {
      const id = record.id;

      return Array.isArray(ids)
        ? ids.indexOf(id) >= 0
        : ids === id;
    });
  }

  /** @inheritdoc */
  find(type, include = [], options = {}) {
    // if (!(type in store)) throw new AdapterError();
    // if (!Array.isArray(ids)) throw new Error(); move to options validation function

    const { ids, filter, fields, page, sort } = options;

    // if we throw an AdapterError, then the empty array isn't needed
    let records = deepClone(this.store[type]) || [];

    // filter by ids
    if (ids) records = records.filter(record => ids.indexOf(record.id) >= 0);

    // filter by operators
    if (filter) records = records.filter(record => didFilterPass(record, filter));

    // exclude fields
    if (fields) {
      records = records.map(record => {
        Object.keys(fields).forEach(key => {
          if (!fields[key]) delete record[key];
        });

        return record;
      });
    }

    // paginate
    const count = records.length;

    if (page) {
      const { offset, limit } = page;

      records = records.slice(
        (offset || 0),
        (offset || 0) + (limit || count)
      );
    }

    // sort
    if (sort) {
      const keys = Object.keys(sort);

      records.sort((a, b) => {
        for (const key of keys) return compare(sort[key], a[key], b[key]);
      });
    }

    // populate
    if (include.length) {
      records = records.map(record => {
        for (const field of include) {
          if (field in record) {
            // what if multiplicity is 'many' and record[field] is a single id?
            const relationship = this.schemas[type].relationships[field];
            const retrievedRecords = this.retrieve(relationship.type, record[field]);

            record[field] = relationship.multiplicity === 'many'
              ? [retrievedRecords]
              : retrievedRecords;
          }
        }

        return record;
      });
    }

    records.count = count;
    return Promise.resolve(records);
  }
}
