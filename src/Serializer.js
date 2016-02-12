/* eslint-disable no-unused-vars */
export default class Serializer {
  /**
   * Instantiates a serializer.
   *
   * @param {Object} [options={}]
   * @param {Number} [options.port=5000]
   * @param {String} [options.namespace='api']
   * @returns {Serializer}
   */
  constructor(options = {}) {
  }

  /**
   * Serializes a resource into an object that the client can consume.
   *
   * @param {Resource} resource - The entry node on the resource graph.
   * @returns {Object} - Serialized response.
   */
  serialize(resource) {
  }

  /**
   * Deserializes an object into object that Restle can consume.
   *
   * @param {Object} object - A JSON object.
   * @returns {Object} - Deserialized object.
   */
  deserialize(object) {
  }
}
