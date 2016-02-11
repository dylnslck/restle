/* eslint-disable no-unused-vars */
export default class Relationship {
  /**
   * Instantiates a Relationship instance. If the relationship is to many then `child` will be a
   * ResourceArray, and if it's to one then it will be a Resource.
   * @constructor
   * @param {Resource} parent
   * @param {Resource|ResourceArray} child
   */
  constructor(parent, child) {
  }

  /**
   * Returns the relationship's parent.
   *
   * @returns {Resource}
   */
  get parent() {
  }

  /**
   * Returns the child resource or resource array, depending on the
   * relationship's multiplicity.
   *
   * @returns {Resource|ResourceArray}
   */
  get child() {
  }

  /**
   * @todo Document.
   */
  set child(target) {
  }

  /**
   * @todo Document.
   */
  append() {
  }

  // TODO: do we want a multiplicity property?
}
