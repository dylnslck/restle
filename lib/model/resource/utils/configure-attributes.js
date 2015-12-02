export default function configureAttributes(attributes, data) {
  const result = {}

  for (let attribute in attributes) {
    if (!(attribute in data))
      continue;

    const value = data[attribute];

    if (undefined !== value)
      result[attribute] = value;
  }

  return result;
};
