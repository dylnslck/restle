import _ from 'lodash';
import mongoose from 'mongoose';

const attr = (type) => {
  // TODO: make sure all types are accounted for
  const types = {
    string: String,
    'boolean': Boolean,
    number: Number,
    date: Date,
  };

  return types[type];
}

const hasMany = (type) => {
  return [{
    ref: type,
    type: mongoose.Schema.Types.ObjectId,
  }];
}

const belongsTo = (type) => {
  return {
    ref: type,
    type: mongoose.Schema.Types.ObjectId,
  };
}

export default function(schema) {
  const parsedSchema = {};
  let fieldType;
  let fieldValue;

  // TODO: validate schema
  _.each(_.keys(schema), (key) => {
    fieldType = schema[key];

    // FIXME: dirty code
    if (fieldType.attr) {
      fieldValue = fieldType.attr;
      parsedSchema[key] = attr(fieldValue);
    } else if (fieldType.hasMany) {
      fieldValue = fieldType.hasMany;
      parsedSchema[key] = hasMany(fieldValue);
    } else {
      fieldValue = fieldType.belongsTo;
      parsedSchema[key] = belongsTo(fieldValue);
    }
  });

  return parsedSchema;
}
