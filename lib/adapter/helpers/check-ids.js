export default function(ids, record) {
  ids = ids.map(id => Number(id));

  return ids.indexOf(Number(record.id)) >= 0;
}
