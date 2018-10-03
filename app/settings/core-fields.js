const {
  createElement,
} = require('react');
const {
  titleize,
} = require('i')(false);

const BooleanField = require('./fields/boolean-field');
const ColorField = require('./fields/color-field');
const SelectField = require('./fields/select-field');
const TextField = require('./fields/text-field');

const boolean = (property, value, schema, onChange) => createElement(
  BooleanField, {
    key: property,
    property,
    value,
    label: schema.title || titleize(property.split('.').pop()),
    onChange: onChange.bind(this),
  },
);

const color = (property, value, schema, onChange) => createElement(
  ColorField, {
    key: property,
    property,
    value,
    label: schema.title || titleize(property.split('.').pop()),
    onChange: onChange.bind(this),
  },
);

const select = (property, value, schema, onChange) => createElement(
  SelectField, {
    key: property,
    property,
    value,
    label: schema.title || titleize(property.split('.').pop()),
    options: schema.enum,
    onChange: onChange.bind(this),
  },
);

const string = (property, value, schema, onChange) => {
  if (schema.enum !== null && schema.enum !== undefined) {
    return select(property, value, schema, onChange);
  }

  return createElement(
    TextField, {
      key: property,
      property,
      value,
      label: schema.title || titleize(property.split('.').pop()),
      onChange: onChange.bind(this),
    },
  );
};

const integer = (property, value, schema, onChange) => string(property, value, schema, onChange);

const number = (property, value, schema, onChange) => string(property, value, schema, onChange);

module.exports = {
  boolean,
  color,
  select,
  string,
  integer,
  number,
};
