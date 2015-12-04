import ResourceArray from '../../resource-array';
import Resource from '../../resource';
import inflect from 'i';

/**
 * This serializes an included document used for serializing a resource.
 *
 * @private
 * @param {Object} resource
 * @param {Object} [options={}]
 * @return {Object}
 */
export default function compoundDocument(resource, options = {}) {
  const i = inflect();
  const { id, type, attributes } = resource;
  const { namespace } = options;

  const links = {
    self: `${namespace}/${i.pluralize(type)}/${id}`,
  };

  const include = {
    id: `${id}`,
    type, links, attributes,
    relationships: {},
  };

  for (let field in resource.relationships) {
    let relationship = resource.relationships[field];
    let { child, isMany } = relationship;

    if (child instanceof Resource) {
      include.relationships[field] = {
        data: {
          id: `${child.id}`,
          type: child.type,
        },
      };

      continue;
    }

    if (child instanceof ResourceArray) {
      include.relationships[field] = {
        data: child.resources.map(resource => {
          return { id: `${resource.id}`, type: resource.type };
        }),
      };

      continue;
    }

    if (Array.isArray(child) && child.length) {
      include.relationships[field] = {
        data: child.map(c => {
          return { id: `${c}`, type: relationship.type };
        }),
      };

      continue;
    }

    if (!!child) {
      include.relationships[field] = {
        data: { id: `${child}`, type: relationship.type },
      };

      continue;
    }

    include.relationships[field] = isMany
      ? { data: [] }
      : { data: null };

  }

  return include;
}
