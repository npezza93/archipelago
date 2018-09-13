const {createElement} = require('react')
const coreFields = require('./core-fields')
const ArrayField = require('./fields/array-field')

const array = (property, value, schema, onChange) => {
  return createElement(
    ArrayField, {
      property,
      value,
      schema,
      onChange: onChange.bind(this)
    }
  )
}

module.exports = coreFields
module.exports.array = array
