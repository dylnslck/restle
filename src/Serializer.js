/* eslint-disable no-unused-vars */
/**
 * The Serializer interface.
 *
 * @interface
 */
export default class Serializer {
  /**
   * Serializes a `Resource` into an object that the client can consume.
   *
   * @private
   * @param {Resource} resource - The entry node on the resource graph.
   * @param {Object} [options] - Data that can be helpful when serializing.
   * @returns {Object} - Serialized response.
   */
  serialize(resource, options = {}) {
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
