/* eslint-disable no-unused-vars */
export default class Serializer {
  /**
   * Instantiates a `Serializer`.
   *
   * @constructor
   * @private
   * @param {Object} [options={}]
   * @param {Number} [options.port=5000]
   * @param {String} [options.namespace='api']
   */
  constructor(options = {}) {
  }

  /**
   * Serializes a `Resource` into an object that the client can consume.
   *
   * @private
   * @param {Resource} resource - The entry node on the resource graph.
   * @returns {Object} - Serialized response.
   */
  serialize(resource) {
  }

  /**
   * Deserializes an object into an object that Restle can consume.
   *
   * @private
   * @param {Object} object - A JSON object.
   * @returns {Object} - Deserialized object.
   */
  deserialize(object) {
  }
}
