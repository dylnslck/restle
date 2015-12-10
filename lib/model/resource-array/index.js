import Resource from '../resource';
import Model from '../index';
import inflect from 'i';
import _ from 'lodash';

/**
 * A ResourceArray is a class that handles multiple resources.
 *
 * @class ResourceArray
 */
export default class ResourceArray {
  /**
   * @ignore
   */
  constructor(model, data) {
    if (undefined === model)
      throw Error('The `model` argument is required to create a resource array.');

    if (!(model instanceof Model))
      throw new TypeError('The `model` argument must be an instance of `Model`.')

    this.model = model;
    this.type = model.type;
    this.count = (data && data.count) || 0;

    this.resources = data
      ? data.map(resource => Resource.create(model, resource))
      : [];
  }

  /**
   * @ignore
   */
  static create() {
    return new ResourceArray(...arguments);
  }

  /**
   * @ignore
   */
  get length() {
    return this.resources.length;
  }

  /**
   * @ignore
   */
  serialize(options = {}) {
    const { resources, count, model } = this;

    const i = inflect();
    const data = [];
    const included = [];
    const plural = i.pluralize(model.type);
    const namespace = undefined !== options.namespace
      ? `/${options.namespace}`
      : ``;

    const links = {
      self: `${namespace}/${plural}`,
    };

    // TODO: default limit
    if ('page' in options) {
      let limit = options.page.limit || 0;
      let offset = options.page.offset || 0;
      links.page = {};

      // prev
      if (offset > 0)
        links.page.prev = `${namespace}/${plural}?page[offset]&page[limit]`;

      // next
      if (count > limit + offset)
        links.page.next = `${namespace}`
    }

    for (let resource of resources) {
      let serialized = resource.serialize();

      data.push(serialized.data);

      for (let include of serialized.included) {
        let id = `${include.id}`;

        if (!_.find(included, { id }))
          included.push(include);
      }
    }

    return {
      data, links, included, meta: { total: count },
    };
  }
}
