import _ from 'lodash';

export default function serializeRequest(body) {
  const data = body.data;
  const serialized = {};

  // collect attributes
  _.each(_.keys(data.attributes), attribute => {
    serialized[attribute] = data.attributes[attribute];
  });

  // collect relationships
  _.forOwn(data.relationships, (value, relationship) => {
    const relationshipData = value.data;

    if (_.isEmpty(relationshipData) && _.isArray(relationshipData)) {
      serialized[relationship] = [];
      return;
    }

    if (_.isNull(relationshipData)) {
      serialized[relationship] = null;
      return;
    }

    if (_.isArray(relationshipData)) {
      serialized[relationship] = [];

      _.each(relationshipData, relation => {
        serialized[relationship].push(relation.id);
      });
    } else {
      serialized[relationship] = relationshipData.id;
    }
  });

  return serialized;
}
