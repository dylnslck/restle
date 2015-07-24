import inflect from 'i';

/**
 * This utility standardizes a model name by transforming it into a singular,
 * lower-case value.
 *
 * For example: Users -> user
 *
 * @return {String}
 */
export default function parseModelName(modelName) {
  const i = inflect();

  return i.singularize(modelName.toLowerCase());
}
