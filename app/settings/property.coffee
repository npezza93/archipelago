React                         = require 'react'
{ TextField, Select, Switch } = require 'rmwc'
{ ChromePicker }              = require 'react-color'
{ splitKeyPath }              = require 'key-path-helpers'
decamelize                    = require 'decamelize'
titleize                      = require 'titleize'

module.exports =
class Property extends React.Component
  constructor: (props) ->
    super(props)

    @state = active: false
    @state[props.property] = archipelago.config.get(props.property)
    @_bindListener()

  render: ->
    {
      text: @text.bind(this)
      select: @select.bind(this)
      switch: @switch.bind(this)
      color: @color.bind(this)
    }[@inputType(@props.schema)].call(this)

  inputType: (schema) ->
    switch schema.type
      when 'boolean' then 'switch'
      when 'color' then 'color'
      when 'integer', 'float', 'rawString' then 'text'
      when 'string'
        if schema.enum?
          'select'
        else
          'text'

  text: ->
    React.createElement(
      TextField
      datakey: @props.property
      label: @_propertyTitle()
      value: @state[@props.property]
      onChange: (e) =>
        @setState("#{@props.property}": e.target.value)
        archipelago.config.set(@props.property, e.target.value)
    )

  select: ->
    React.createElement(
      Select
      datakey: @props.property
      label: @_propertyTitle()
      value: @state[@props.property]
      options: @props.schema.enum
      onChange: (e) =>
        @setState("#{@props.property}": e.target.value)
        archipelago.config.set(@props.property, e.target.value)
    )

  switch: ->
    React.createElement(
      Switch
      datakey: @props.property
      checked: @state[@props.property]
      label: @_propertyTitle()
      onChange: (e) =>
        @setState("#{@props.property}": e.target.checked)
        archipelago.config.set(@props.property, e.target.checked)
    )

  color: ->
    React.createElement(
      'div'
      className: 'color-container'
      key: @props.property
      style: if @state.active then zIndex: 2
      @colorBackdrop()
      @colorText()
    )

  colorBackdrop: ->
    return unless @state.active

    React.createElement(
      'div'
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
      onClick: () =>
        @setState(active: false)
    )

  colorText: ->
    React.createElement(
      TextField
      datakey: @props.property
      label: @_propertyTitle()
      value: @state[@props.property]
      onClick: (e) =>
        @setState(active: true)
      onChange: (e) =>
        @setState("#{@props.property}": e.target.value)
        archipelago.config.set(@props.property, e.target.value)
      @colorInput()
    )

  colorInput: ->
    return unless @state.active

    React.createElement(
      'div'
      className: 'color-picker'
      React.createElement(
        ChromePicker
        color: archipelago.config.get(@props.property)
        onChangeComplete: (color) =>
          rgba = "rgba(#{Object.values(color.rgb).join(",")})"
          @setState("#{@props.property}": rgba)
          archipelago.config.set(@props.property, rgba)
      )
    )

  _propertyTitle: ->
    if @props.schema.title?
      @props.schema.title
    else
      titleize(decamelize([...splitKeyPath(@props.property)].pop(), ' '))

  _bindListener: ->
    archipelago.config.onDidChange @props.property, (newValue) =>
      if @state[@props.property] != newValue
        @setState("#{@props.property}": newValue)
