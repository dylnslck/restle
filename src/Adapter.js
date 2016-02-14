/* eslint-disable no-unused-vars */
/** Adapter class. */
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
   * @async
   * @private
   * @returns {Boolean}
   * @throws {AdapterError}
   */
  disconnect() {
  }

  /**
   * This method retrieves raw records from the persistence layer with matching ids as 'ids', or
   * all records if `ids` is undefined.
   *
   * @async
   * @private
   * @param {Model} model
   * @param {String|String[]} ids
   * @returns {Object|Object[]}
   */
  retrieve(model, ids) {
  }

  /**
   * Finds records from the persistence layer that match the `options` criteria. The `options`
   * object is the same argument that `Model.find` includes. This must return an array of sideloaded
   * objects, and the resulting array must have a `count` property equal to the number of records
   * pre-pagination.
   *
   * @see Model.find
   * @async
   * @private
   * @param {Model} model
   * @param {Object} [options={}]
   * @returns {Object[]}
   * @throws {AdapterError}
   */
  find(model, options = {}) {
  }

  /**
   * Creates a record on the persistence layer. This method's responsibility is to add the record
   * then return the sideloaded JSON.
   *
   * @async
   * @private
   * @param {Model} model
   * @param {Object} data
   * @return {Object}
   * @throws {AdapterError}
   */
  create(model, data) {
  }

  /**
   * Updates a record on the persistence layer. This method's responsibility is to update the record
   * then return the sideloaded JSON.
   *
   * @async
   * @private
   * @param {Model} model
   * @param {Object} data
   * @param {String} id
   * @return {Object}
   * @throws {AdapterError}
   */
  update(model, id, data) {
  }

  /**
   * Deletes a record from the persistence layer.
   *
   * @async
   * @private
   * @param {Model} model
   * @param {String} id
   * @returns {Boolean}
   */
  delete(model, id) {
  }
}
