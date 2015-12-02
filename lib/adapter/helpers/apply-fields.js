/*
fields: {
  name: true,
  age: true,
  pets: {
    color: true,
  },
}
*/

export default function applyFields(fields, records) {
  for (let i = records.length; i--;) {
    let record = records[i];

    for (let field in record) {
      if (!(field in fields) && field !== 'id') {
        delete record[field];
      }
    }
  }
};
