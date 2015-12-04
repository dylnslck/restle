import Relationship from '../../relationship';
import ResourceArray from '../../resource-array';
import Resource from '../../resource';

/**
 * This configures relationships for serializing relationships.
 *
 * @private
 * @param {Model} parent
 * @param {Object} relationships
 * @param {Object} data
 * @return {Object}
 */
export default function configureRelationships(parent, relationships, data) {
  const result = {};

  for (let field in relationships) {
    const { isMany, type, model } = relationships[field];
    const value = data[field];
    let child;

    if (undefined !== value) {
      if (Array.isArray(value)) {
        const hasIds = undefined !== value[0] && undefined !== value[0].id;

        child = hasIds
          ? ResourceArray.create(model, value)
          : value;
      } else {
        const hasId = undefined !== value.id;

        child = hasId
          ? Resource.create(model, value)
          : value;
      }
    } else {
      child = isMany
        ? ResourceArray.create(model, null)
        : null;
    }

    result[field] = Relationship.create(parent, child, {
      model, field, type, isMany,
    });
  }

  return result;
};
