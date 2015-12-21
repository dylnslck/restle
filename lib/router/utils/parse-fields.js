/**
 * Parses query string fields and builds a proper filter object that Restle
 * can consume.
 *
 * For example, /api/users?username=dylan turns into
 * /api/users?filter[username]=dylan.
 *
 * @private
 * @param {String} queru
 * @return {Object} sort
 */
export default function parseFields(model, fields) {
  const filters = {};

  for (let field in fields)
    if (field in model.attributes || field in model.relationships)
      filters[field] = fields[field];

  return filters;
}
