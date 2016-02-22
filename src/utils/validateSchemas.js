export default function validateSchemas(schemas, types, regex) {
  const keys = Object.keys;
  const values = Object.values;

  // check the schema fields
  return keys(schemas).every(regex.test) && schemas.every(schema => {
    let valid = true;
    const a = 'attributes';
    const r = 'relationships';
    const A = schema[a];
    const R = schema[r];
    const validateTransforms = transforms =>
      keys(transforms).every(key => ['in', 'out'].includes(key)) &&
      values(transforms).every(value => typeof value === 'function');
    const validateAttribute = attribute => {
      // check for `type` field
      if (!('type' in attribute)) return false;

      // check for valid attribute fields
      if (!keys(attribute).every(key =>
          ['type', 'default', 'trigger', 'transforms', 'unique', 'required'].includes(key))) {
        return false;
      }

      // check for valid attribute values
      if (keys(attribute).every(key => {
        switch (key) {
          case 'type':
            return types.includes(key);
          case 'trigger':
            return typeof attribute.trigger === 'function';
          case 'transforms':
            return validateTransforms(attribute.transforms);
          default:
            return true;
        }
      })) return false;
    };
    const validateRelationship = (relationship, attributes) => {
      // check for `type` field
      if (!('type' in relationship)) return false;

      // check for valid relationship fields
      if (!keys(relationship).every(key => ['type', 'multiplicity', 'required'].includes(key))) {
        return false;
      }

      // check for valid relationship values
      keys(relationship).every(key => {
        if (key === 'type') {
          return attributes.includes(key);
        }
        return true;
      });
    };

    valid &= typeof schema === 'object';

    // check for `attributes` and `relationships` fields
    valid &= keys(schema).every(key => [a, r].includes(key));

    // check that `schema.attributes` and `schema.relationships` fields are unique and valid
    const ar = keys(A).concat(keys(R));
    valid &= ar.length === [...new Set(ar)].length && ar.every(regex.test);

    // check that every attribute and relationship is valid
    valid &= values(A).every(validateAttribute);
    valid &= values(R).every(relationship => validateRelationship(relationship, keys(A)));

    return valid;
  });
}
