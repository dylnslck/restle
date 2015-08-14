import parseModelName from './parse-model-name';

/**
 * This function loops through the fields object and retrieves
 * the proper relationship data.
 *
 * ```js
 * // example response
 * {
 *   comments: { type: 'comment', isMany: true },
 *   author: { type: 'user', isMany: false }
 * }
 * ```
 * @param {Object} fields
 * @param {String} type
 * @param {String} relationship
 * @return {Object}
 */
export default function(fields, type, relationship) {
  const modelName = parseModelName(type);

  return fields[modelName] && fields[modelName].relationships && fields[modelName].relationships[relationship];
}
