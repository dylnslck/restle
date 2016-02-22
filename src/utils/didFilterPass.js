import isDeepTruthy from './isDeepTruthy';
const keys = Object.keys;

function applyOperation(op, expected, value) {
  if (value === undefined) return false;

  switch (op) {
    case '$gt':
      return value > expected;

    case '$gte':
      return value >= expected;

    case '$lt':
      return value < expected;

    case '$lte':
      return value <= expected;

    case '$in':
      return expected.includes(value);

    case '$nin':
      return !expected.includes(value);

    case '$eq':
      return expected === value;

    case '$neq':
      return expected !== value;

    default:
      return false;
  }
}

/**
 * Normalizes a filter operation object.
 *
 * ```js
 * { age: 15 } // transforms into:
 * { age: { $eq: 15 } }
 * ```
 *
 * @param {Object} object
 * @returns {Object}
 */
function normalize(object) {
  return typeof object !== 'object'
    ? { $eq: object }
    : object;
}

export default function didFilterPass(object, filter = {}) {
  return isDeepTruthy(keys(filter).map(key => {
    const ops = normalize(filter[key]);

    return keys(ops).map(op => applyOperation(op, ops[op], object[key]));
  }));
}
