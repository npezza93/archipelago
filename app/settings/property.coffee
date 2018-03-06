React            = require 'react'
{ splitKeyPath } = require 'key-path-helpers'
decamelize       = require 'decamelize'
titleize         = require 'titleize'
jsesc            = require 'jsesc'
BooleanField     = require './fields/boolean_field'
ColorField       = require './fields/color_field'
SelectField      = require './fields/select_field'
TextField        = require './fields/text_field'

module.exports =
class Property extends React.Component
  constructor: (props) ->
    super(props)

    @state = "#{props.property}": archipelago.config.get(props.property)

    @bindListener()

  render: ->
    this[@props.schema.type].call(this)

  boolean: ->
    React.createElement(
      BooleanField
      datakey: @props.property
      value: @state[@props.property]
      label: @title()
      onChange: (newValue) => archipelago.config.set(@props.property, newValue)
    )

  color: ->
    React.createElement(
      ColorField
      datakey: @props.property
      value: @state[@props.property]
      label: @title()
      onChange: (newValue) => archipelago.config.set(@props.property, newValue)
    )

  integer: ->
    @string()

  float: ->
    @integer()

  rawString: ->
    React.createElement(
      TextField
      datakey: @props.property
      value: jsesc @state[@props.property]
      label: @title()
      onChange: (newValue) => archipelago.config.set(@props.property, newValue)
    )

  string: ->
    if @props.schema.enum?
      @select()
    else
      React.createElement(
        TextField
        datakey: @props.property
        value: @state[@props.property]
        label: @title()
        onChange: (newValue) =>
          archipelago.config.set(@props.property, newValue)
      )

  select: ->
    React.createElement(
      SelectField
      datakey: @props.property
      value: @state[@props.property]
      label: @title()
      options: @props.schema.enum
      onChange: (newValue) => archipelago.config.set(@props.property, newValue)
    )

  title: ->
    if @props.schema.title?
      @props.schema.title
    else
      titleize(decamelize([...splitKeyPath(@props.property)].pop(), ' '))

  bindListener: ->
    archipelago.config.onDidChange @props.property, (newValue) =>
      if @state[@props.property] != newValue
        @setState("#{@props.property}": newValue)
