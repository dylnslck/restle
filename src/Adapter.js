/* eslint no-unused-vars: 1 */

// import validateSchemas from './utils/validateSchemas';

/** The Adapter abstract class */
export default class Adapter {
  types = ['number', 'string', 'boolean', 'date', 'object'];
  regex = /^[a-zA-Z0-9]([-_]*[a-zA-Z0-9]+)*$/;

  /**
   * @param {Object} schemas
   *
   * @todo Throws
   */
  constructor(schemas = {}) {
    // class extension validation
    if (this.constructor === Adapter) throw new Error();

    // `types` and `regex` override validation
    // const types = this.types;
    // const regex = this.regex;
    // if (!(Array.isArray(types) && types.every(type => typeof type === 'string')))
    // throw new Error();
    // if (!(regex instanceof RegExp)) throw new Error();

    // method override validation
    // if (typeof this.connect !== 'function') throw new Error();
    // if (typeof this.disconnect !== 'function') throw new Error();
    // if (typeof this.find !== 'function') throw new Error();
    // if (typeof this.create !== 'function') throw new Error();
    // if (typeof this.update !== 'function') throw new Error();
    // if (typeof this.delete !== 'function') throw new Error();

    // input validation
    // if (!validateSchemas(schemas, types, regex)) throw new Error();
  }

  /**
   * Connect to the persistence layer.
   *
   * @private
   * @async
   *
   * @todo Throws
   */
  connect() {
  }

  /**
   * Disconnect from the persistence layer.
   *
   * @private
   * @async
   *
   * @todo Throws
   */
  disconnect() {
  }

  /**
   * Returns an array of objects representing records from the persistence layer of `type` that
   * match the `options` criteria. Those objects will be sideloaded according to the relationships
   * specified in `include`. The `options` object is the same as in @link{Model#find}.
   *
   * @private
   * @async
   * @param {String} type
   * @param {String[]} [include=[]]
   * @param {Object} [options={}]
   * @returns {Object[]}
   *
   * @todo Throws
   */
  find(type, include = [], options = {}) {
  }

  /**
   * Creates a record on the persistence layer. This method's responsibility is to add the record
   * then return the sideloaded JSON.
   *
   * @async
   * @private
   * @param {String} type
   * @param {Object} data
   * @returns {Object}
   *
   * @todo Throws
   */
  create(type, data, include) {
  }

  /**
   * Updates a record on the persistence layer. This method's responsibility is to update the record
   * then return the sideloaded JSON.
   *
   * @private
   * @async
   * @param {String} type
   * @param {Object} data
   * @param {String} id
   * @return {Object}
   *
   * @todo Throws
   */
  update(type, id, data, include) {
  }

  /**
   * Deletes a record from the persistence layer.
   *
   * @private
   * @async
   * @param {String} type
   * @param {String} id
   * @returns {Boolean}
   *
   * @todo Throws
   */
  delete(type, id) {
  }
}
