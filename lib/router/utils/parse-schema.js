import _ from 'lodash';
import mongoose from 'mongoose';

const attr = (type, validators = {}) => {
  // TODO: make sure all types are accounted for
  const types = {
    string: String,
    'boolean': Boolean,
    number: Number,
    date: Date,
  };

  const attribute = {
    type: types[type],
  };

  if (validators.required) {
    attribute.required = true;
  }

  if (validators.unique) {
    attribute.unique = true;
  }

  if (type === 'number' && validators.min) {
    attribute.min = validators.min;
  }

  if (type === 'number' && validators.max) {
    attribute.max = validators.max;
  }

  return attribute;
};

const hasMany = (type) => {
  return [{
    ref: type,
    type: mongoose.Schema.Types.ObjectId,
  }];
};

const belongsTo = (type) => {
  return {
    ref: type,
    type: mongoose.Schema.Types.ObjectId,
  };
};

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

      parsedSchema[key] = attr(fieldValue, {
        required: fieldType.required,
        unique: fieldType.unique,
        min: fieldType.min,
        max: fieldType.max,
      });
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
