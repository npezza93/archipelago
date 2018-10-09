import React from 'react'
import i from 'i'

/* eslint-disable import/no-unresolved */
import BooleanField from '@/settings/fields/boolean-field'
import ColorField from '@/settings/fields/color-field'
import SelectField from '@/settings/fields/select-field'
import TextField from '@/settings/fields/text-field'
/* eslint-enable import/no-unresolved */

const boolean = (property, value, schema, onChange) => {
  return <BooleanField key={property} property={property}
    value={value}
    label={schema.title || i(false).titleize(property.split('.').pop())}
    onChange={onChange.bind(this)} />
}

const color = (property, value, schema, onChange) => {
  return <ColorField key={property} property={property}
    value={value}
    label={schema.title || i(false).titleize(property.split('.').pop())}
    onChange={onChange.bind(this)} />
}

const select = (property, value, schema, onChange) => {
  return <SelectField key={property} property={property}
    value={value}
    label={schema.title || i(false).titleize(property.split('.').pop())}
    onChange={onChange.bind(this)}
    options={schema.enum} />
}

const string = (property, value, schema, onChange) => {
  if (schema.enum !== null && schema.enum !== undefined) {
    return select(property, value, schema, onChange)
  }

  return <TextField key={property} property={property}
    value={value}
    label={schema.title || i(false).titleize(property.split('.').pop())}
    onChange={onChange.bind(this)} />
}

const integer = (property, value, schema, onChange) => {
  return string(property, value, schema, onChange)
}

const number = (property, value, schema, onChange) => {
  return string(property, value, schema, onChange)
}

export {boolean, color, select, string, integer, number}
