React            = require 'react'
{ splitKeyPath } = require 'key-path-helpers'
BooleanField     = require './boolean_field'
ColorField       = require './color_field'
SelectField      = require './select_field'
TextField        = require './text_field'

module.exports =
class ArrayField extends React.Component
  render: ->
    elements = for element, i in (@props.value || [])
      @renderElement(element, i)

    elements.concat(@addElement())

  renderElement: (element, index) ->
    React.createElement(
      'div'
      key: index
      className: 'array-element-container'
      @renderItems(element, index)
      @removeElement(index)
    )

  renderItems: (element, index) ->
    if @props.schema.items.type is 'object'
      for property, propertySchema of @props.schema.items.properties
        this[propertySchema.type].call(
          this, property, propertySchema, element[property], index
        )
    else
      this[@props.schema.items.type].call(
        this, @props.datakey, @props.schema.items, element, index
      )

  addElement: ->
    React.createElement(
      'div'
      key: Math.random()
      className: 'create-array-element'
      onClick: @createElement.bind(this)
      "add new #{@props.datakey.singularize}"
    )

  removeElement: (index) ->
    React.createElement(
      'div'
      className: 'remove-array-element'
      onClick: @destroyElement.bind(this, index)
      '\u00D7'
    )

  createElement: ->
    if @props.schema.items.type is 'object'
      newItem = {}
      for property, propertySchema of @props.schema.items.properties
        newItem[property] = propertySchema.default || null
    else
      newItem = @props.schema.items.default || null

    @props.onChange.call(this, (@props.value || []).concat(newItem))

  destroyElement: (index) ->
    @props.value.splice(index, 1)

    @props.onChange.call(this, (@props.value || []))

  rawString: (property, schema, value, index) ->
    React.createElement(
      TextField
      key: property
      value: value
      label: @title(property, schema)
      onChange: (newValue) =>
        @props.value[index][property] = newValue
        @props.onChange.call(this, @props.value)
    )

  integer: (property, schema, value, index) ->
    @string(property, schema, value, index)

  float: (property, schema, value, index) ->
    @integer(property, schema, value, index)

  string: (property, schema, value, index) ->
    if schema.enum?
      @select()
    else
      React.createElement(
        TextField
        key: property
        value: value
        label: @title(property, schema)
        onChange: (newValue) =>
          @props.value[index][property] = newValue
          @props.onChange.call(this, @props.value)
      )

  title: (property, schema) ->
    if schema.title?
      schema.title
    else
      [...splitKeyPath(property)].pop().titleize
