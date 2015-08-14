import parseModelName from './parse-model-name';

/**
 * This function loops through the fields object and retrieves
 * the proper attribute data.
 *
 * ```js
 * // example response
 * {
 *   name: { type: 'string' },
 *   birthday: { type: 'date' }
 * }
 * ```
 * @param {Object} fields
 * @param {String} type
 * @param {String} attribute
 * @return {Object}
 */
export default function(fields, type, attribute) {
  const modelName = parseModelName(type);

  return fields[modelName] && fields[modelName].attributes && fields[modelName].attributes[attribute];
}
