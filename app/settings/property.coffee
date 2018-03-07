React          = require 'react'
FieldComponent = require './field_component'
ArrayField     = require './fields/array_field'

module.exports =
class Property extends FieldComponent
  constructor: (props) ->
    super(props)

    @state = "#{props.property}": archipelago.config.get(
      props.property, { keepEscaped: true }
    )

    @bindListener()

  render: ->
    this[@props.schema.type].call(
      this
      @props.property
      @state[@props.property]
      @props.schema
      (newValue) => archipelago.config.set(@props.property, newValue)
    )

  array: (property, value, schema, onChange) ->
    React.createElement(
      ArrayField
      property: property
      value: value
      schema: schema
      onChange: onChange.bind(this)
    )

  bindListener: ->
    archipelago.config.onDidChange @props.property, (newValue) =>
      if @state[@props.property] != newValue
        @setState("#{@props.property}": newValue)
    , keepEscaped: true
