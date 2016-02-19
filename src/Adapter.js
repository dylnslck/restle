/* eslint-disable no-unused-vars */
/**
 * The Adapter interface
 *
 * @interface
 */
export default class Adapter {
  /**
   * Connect to the persistence layer.
   *
   * @private
   * @async
   * @throws {AdapterError}
   */
  connect() {
  }

  /**
   * Disconnect from the persistence layer.
   *
   * @private
   * @async
   * @throws {AdapterError}
   */
  disconnect() {
  }

  /**
   * Returns an array of objects representing records from the persistence layer of `type` that
   * match the `options` criteria. Those objects will be sideloaded according to the relationships
   * specified in `include`. The `options` object is the same in @link{Model#find}.
   *
   * @private
   * @async
   * @param {String} type
   * @param {(String|String[])} include
   * @param {Object} [options={}]
   * @returns {Object[]}
   * @throws {AdapterError}
   */
  find(type, include, options = {}) {
  }

  findOne() {
  }

  /**
   * This method retrieves raw records from the persistence layer with matching 'ids', or all
   * records if `ids` is undefined.
   *
   * @private
   * @async
   * @param {String} type
   * @param {String} id
   * @returns {Object}
   *
   * @todo Throws
   */
  fetchRecord(type, id, include) {
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
