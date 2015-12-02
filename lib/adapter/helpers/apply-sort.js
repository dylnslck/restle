/*
sort: {
  name: 'asc',
  age: 'desc',
},
*/

export default function applySort(sort, records) {
  const fields = Object.keys(sort);

  records.sort((a, b) => {
    for (let field of fields)
      return compare(sort[field], a[field], b[field]);
  });
};

const compare = (order, x, y) => {
  const type = typeof x === typeof y
    ? typeof x
    : false;

  // can't compare different types
  if (!type) return 0;

  if (order === 'asc') return x > y ? 1 : -1;
  else if (order === 'desc') return x < y ? 1 : -1;

  // default is asc
  return 1;
};
