// all serializing goes here

export default class Serializer {
  serialize(method, type, json) {
    let res = {};
    let baseUrl;
    const i = inflect();
    const fields = this._fields[i.singularize(type)];
    /**
     *  TODO: this should be a method and should work for any resource object
     *  or relationship
     */

    if (_.isArray(json)) {
      baseUrl = `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}`;
      res.data = [];

      _.each(json, doc => {
        res.data.push(this._serializeResourceObject(type, doc, true).data);
      });
    } else {
      baseUrl = `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}/${json._id}`;
      res = this._serializeResourceObject(type, json);
    }

    if (method === 'post' || method == 'patch') {
      res.data.links = { self: baseUrl };
    } else {
      res.links = { self: baseUrl };
    }

    return res;
  }


}
