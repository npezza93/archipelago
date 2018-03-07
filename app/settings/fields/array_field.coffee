React          = require 'react'
FieldComponent = require '../field_component'

module.exports =
class ArrayField extends FieldComponent
  render: ->
    elements = for element, i in @props.value
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

  renderItems: (value, index) ->
    if @props.schema.items.type is 'object'
      for property, propertySchema of @props.schema.items.properties
        @renderItem(property, value[property], propertySchema, index)
    else
      @renderItem(@props.property, value, @props.schema.items, index)

  renderItem: (property, value, schema, index) ->
    this[schema.type].call(
      this
      property
      value
      schema
      (newValue) =>
        @props.value[index][property] = newValue
        @props.onChange.call(this, @props.value)
    )

  addElement: ->
    React.createElement(
      'div'
      key: Math.random()
      className: 'create-array-element'
      onClick: @createElement.bind(this)
      "add new #{@props.property.singularize}"
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

    @props.onChange.call(this, @props.value.concat(newItem))

  destroyElement: (index) ->
    @props.value.splice(index, 1)

    @props.onChange.call(this, @props.value)
