React            = require 'react'
{ splitKeyPath } = require 'key-path-helpers'
BooleanField     = require './fields/boolean_field'
ColorField       = require './fields/color_field'
SelectField      = require './fields/select_field'
TextField        = require './fields/text_field'

module.exports =
class FieldComponent extends React.Component
  boolean: (property, value, schema, onChange) ->
    React.createElement(
      BooleanField
      key: property
      property: property
      value: value
      label: @title(property, schema)
      onChange: onChange.bind(this)
    )

  color: (property, value, schema, onChange) ->
    React.createElement(
      ColorField
      key: property
      property: property
      value: value
      label: @title(property, schema)
      onChange: onChange.bind(this)
    )

  integer: (property, value, schema, onChange) ->
    @string(property, value, schema, onChange)

  float: (property, value, schema, onChange) ->
    @string(property, value, schema, onChange)

  rawString: (property, value, schema, onChange) ->
    @string(property, value, schema, onChange)

  string: (property, value, schema, onChange) ->
    if schema.enum?
      @select(property, value, schema, onChange)
    else
      React.createElement(
        TextField
        key: property
        property: property
        value: value
        label: @title(property, schema)
        onChange: onChange.bind(this)
      )

  select: (property, value, schema, onChange) ->
    React.createElement(
      SelectField
      key: property
      property: property
      value: value
      label: @title(property, schema)
      options: schema.enum
      onChange: onChange: onChange.bind(this)
    )

  title: (property, schema) ->
    if schema.title?
      schema.title
    else
      [...splitKeyPath(property)].pop().titleize
