import isDeepTruthy from './isDeepTruthy';

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

export default function didFilterPass(object, filter = {}) {
  return isDeepTruthy(Object.keys(filter).map(key => {
    const ops = filter[key];
    return {
      key,
      filter: typeof ops !== 'object' ? { $eq: ops } : ops,
    };
  }).map(obj => {
    const ops = obj.filter;
    return Object.keys(ops).map(op => applyOperation(op, ops[op], object[obj.key]));
  }));
}
