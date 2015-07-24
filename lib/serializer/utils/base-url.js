import inflect from 'i';

/**
 * This method builds a base url.
 *
 * For example: 'http://localhost:1337/api/people'
 *
 * TODO: change name to something like 'resource-endpoint' and make it work with
 * relationships as well, and improve the arguments
 *
 * @return {String}
 */
export default function(origin, port, namespace, type, id) {
  const i = inflect();

  return `${origin}:${port}${namespace}/${i.pluralize(type)}/${id ? (id + '/') : ''}`;
}
