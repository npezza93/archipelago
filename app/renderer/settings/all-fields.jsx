import React from 'react'

/* eslint-disable import/no-unresolved */
import {boolean, color, select, string, integer, number} from '@/settings/fields/core-fields'
import ArrayField from '@/settings/fields/array-field'
/* eslint-enable import/no-unresolved */

const array = (property, value, schema, onChange) => {
  return <ArrayField
    property={property}
    value={value}
    schema={schema}
    onChange={onChange.bind(this)} />
}

export default {array, boolean, color, select, string, integer, number}
