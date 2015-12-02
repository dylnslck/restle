export default function(ids, record) {
  return ids.indexOf(Number(record.id)) >= 0;
}
