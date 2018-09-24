const {createElement} = require('react')
const {titleize} = require('i')(false)

const BooleanField = require('./fields/boolean-field')
const ColorField = require('./fields/color-field')
const SelectField = require('./fields/select-field')
const TextField = require('./fields/text-field')

const boolean = (property, value, schema, onChange) => {
  return createElement(
    BooleanField, {
      key: property,
      property,
      value,
      label: schema.title || titleize(property.split('.').pop()),
      onChange: onChange.bind(this)
    }
  )
}

const color = (property, value, schema, onChange) => {
  return createElement(
    ColorField, {
      key: property,
      property,
      value,
      label: schema.title || titleize(property.split('.').pop()),
      onChange: onChange.bind(this)
    }
  )
}

const select = (property, value, schema, onChange) => {
  return createElement(
    SelectField, {
      key: property,
      property,
      value,
      label: schema.title || titleize(property.split('.').pop()),
      options: schema.enum,
      onChange: onChange.bind(this)
    }
  )
}

const string = (property, value, schema, onChange) => {
  if (schema.enum !== null && schema.enum !== undefined) {
    return select(property, value, schema, onChange)
  }

  return createElement(
    TextField, {
      key: property,
      property,
      value,
      label: schema.title || titleize(property.split('.').pop()),
      onChange: onChange.bind(this)
    }
  )
}

const integer = (property, value, schema, onChange) => {
  return string(property, value, schema, onChange)
}

const number = (property, value, schema, onChange) => {
  return string(property, value, schema, onChange)
}

const rawString = (property, value, schema, onChange) => {
  return string(property, value, schema, onChange)
}

exports.boolean = boolean
exports.color = color
exports.select = select
exports.string = string
exports.integer = integer
exports.number = number
exports.rawString = rawString
