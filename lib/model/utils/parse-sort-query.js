export default function parseSortQuery(query) {
  const sort = {};
  const fields = query.split(',');

  for (let field of fields)
    sort[trimDelimiter(field)] = field.indexOf('-') === 0
      ? 'desc'
      : 'asc';

  return sort;
}

function trimDelimiter(field) {
  const hasDelimiter = field && (field[0] === '-' || field[0] === '+');

  return hasDelimiter
    ? field.slice(1)
    : field;
}
