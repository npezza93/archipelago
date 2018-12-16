import React from 'react'
import * as coreFields from './core-fields.jsx'
import ArrayField from './array-field.jsx'

const array = (property, value, schema, onChange) => {
  return <ArrayField
    property={property}
    value={value}
    schema={schema}
    onChange={onChange.bind(this)} />
}

export default {array, ...coreFields}
