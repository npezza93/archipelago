import React from 'react'
import i from 'i'
import BooleanField from './boolean-field.jsx'
import ColorField from './color-field.jsx'
import SelectField from './select-field.jsx'
import TextField from './text-field.jsx'
import KeybindingField from './keybinding-field.jsx'

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

const keybinding = (property, value, schema, onChange) => {
  return <KeybindingField
    key={property}
    property={property}
    value={value}
    label={schema.title || i(false).titleize(property.split('.').pop())}
    onChange={onChange.bind(this)} />
}

export {boolean, color, select, string, integer, number, keybinding}
