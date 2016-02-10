export default class Relationship {
  constructor(parent, child) {

  }

  get parent() {

  }

  /**
   * Returns the child resource or resource array, depending on the
   * relationship's multiplicity.
   *
   * @return {Resource|ResourceArray}
   */
  get child() {

  }

  /**
   * Sets the relationship's child to either a resource, resource array, or in
   * the case that the argument is an id, a lookup of the appropriate resource
   * with id id.
   *
   * @param  {Resource|ResourceArray} target
   * @return {[type]}        [description]
   */
  set child(target) {

  }

  append() {

  }
}
