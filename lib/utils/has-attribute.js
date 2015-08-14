import getAttribute from './get-attribute';

/**
 * This function checks to see if a particular type has a particular
 * attribute.
 *
 * @param {Object} fields
 * @param {String} type
 * @param {String} attribute
 * @return {Boolean}
 */
export default function(fields, type, attribute) {
  return !!getAttribute(fields, type, attribute);
}
