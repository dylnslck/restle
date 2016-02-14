/* eslint-disable no-unused-vars */
/**
 * The Adapter interface
 *
 * @interface
 */
export default class Adapter {
  /**
   * Instantiates an `Adapter`.
   *
   * @constructor
   * @private
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
  }

  /**
   * Connect to the persistence layer.
   *
   * @async
   * @private
   * @returns {Boolean}
   * @throws {AdapterError}
   */
  connect() {
  }

  /**
   * Disconnect from the persistence layer.
   *
   * @private
   * @async
   * @returns {Boolean}
   * @throws {AdapterError}
   */
  disconnect() {
  }

  /**
   * This method retrieves raw records from the persistence layer with matching 'ids', or all
   * records if `ids` is undefined.
   *
   * @private
   * @async
   * @param {String} type
   * @param {String|String[]} [ids]
   * @returns {Object|Object[]}
   *
   * @todo Throws
   */
  retrieve(type, ids) {
  }

  /**
   * Finds records from the persistence layer that match the `options` criteria. The `options`
   * object is the same argument that `Model#find` includes. This must return an array of sideloaded
   * objects, and the resulting array must have a `count` property equal to the number of records
   * pre-pagination.
   *
   * @see Model#find
   * @private
   * @async
   * @param {String} type
   * @param {Object} [options={}]
   * @returns {Object[]}
   *
   * @todo Throws
   */
  find(type, options = {}) {
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
  create(type, data) {
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
   * @return {Object}\
   *
   * @todo Throws
   */
  update(type, id, data) {
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
