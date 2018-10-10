import React from 'react'
import * as coreFields from './fields/core-fields.jsx'
import ArrayField from './fields/array-field.jsx'

const array = (property, value, schema, onChange) => {
  return <ArrayField
    property={property}
    value={value}
    schema={schema}
    onChange={onChange.bind(this)} />
}

export default {array, ...coreFields}
