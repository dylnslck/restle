/*
filters: {
  age: {
    $gt: 5,
    $lt: 10,
  },
  name: {
    $in: [ 'Bob', 'Jones' ],
  },
  height: 20,
},
*/

export default function checkFilters(filters, record) {
  const operators = [
    '$gt', '$gte',
    '$lt', '$lte',
    '$in', '$eq',
  ];

  for (let filter in filters) {
    if (!(filter in record))
      return false;

    const operators = filters[filter];

    // FIXME: sloppy
    if (isAllowedPrimitive(operators)) {
      // apply primitive match
      // FIXME: the unstrict equality is on purpose because types aren't
      // being casted properly from the router
      if (record[filter] != operators)
        return false
    } else if (typeof operators === 'function') {
      return operators(record[filter]);
    } else {
      // apply complex filtering
      for (let operator in operators)
        if (!compare(operator, operators[operator], record[filter]))
          return false;
    }
  }

  return true;
};

const isAllowedPrimitive = value => {
  const allowedPrimitives = [
    'boolean',
    'string',
    'number',
  ];

  return allowedPrimitives.indexOf(typeof value) >= 0;
};

const compare = (operator, filter, value) => {
  switch (operator) {
    case '$gt':
      return value > filter;
      break;

    case '$gte':
      return value >= filter;
      break;

    case '$lt':
      return value < filter;
      break;

    case '$lte':
      return value <= filter;
      break;

    case '$in':
      return filter.indexOf(value) >= 0;
      break;

    case '$eq':
      return filter === value;
      break;

    default:
      return filter === value;
      break;
  }
};
