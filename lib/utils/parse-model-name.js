import inflect from 'i';

/**
 * This utility standardizes a model name by transforming it into a singular,
 * lower-case value.
 *
 * For example: Users -> user
 *
 * @private
 * @param {String} name
 * @return {String}
 */
export default function parseModelName(name) {
  const i = inflect();

  return i.singularize(name.toLowerCase());
}
