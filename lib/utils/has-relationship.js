import getRelationship from './get-relationship';

/**
 * This function checks to see if a particular type has a particular
 * relationship.
 *
 * @param {Object} fields
 * @param {String} type
 * @param {String} relationship
 * @return {Boolean}
 */
export default function(fields, type, relationship) {
  return !!getRelationship(fields, type, relationship);
}
