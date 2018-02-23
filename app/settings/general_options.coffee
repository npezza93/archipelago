React                         = require 'react'
{ TextField, Select, Switch } = require 'rmwc'
{ ChromePicker }              = require 'react-color'
titleize                      = require 'titleize'
decamelize                    = require 'decamelize'

module.exports =
class GeneralOptions extends React.Component
  constructor: (props) ->
    super(props)

    @fieldRenderers =
      text: @text.bind(this)
      select: @select.bind(this)
      switch: @switch.bind(this)
      color: @color.bind(this)

    @_bindListeners()

  render: ->
    React.createElement(
      'archipelago-general-options'
      ref: @props.innerRef
      for property, schema of @props.properties
        @make property, schema
    )

  make: (property, schema) ->
    if property is 'seperator'
      React.createElement('div', key: Math.random(), className: 'seperator')
    else
      fieldType = @inputTypeFromSchema(schema)
      @fieldRenderers[fieldType].call(this, property, schema)

  inputTypeFromSchema: (schema) ->
    switch schema.type
      when 'boolean' then 'switch'
      when 'color' then 'color'
      when 'integer', 'float', 'rawString' then 'text'
      when 'string'
        if schema.enum?
          'select'
        else
          'text'

  text: (property, schema) ->
    React.createElement(
      TextField
      key: property
      datakey: property
      label: schema.title || titleize(decamelize(property, ' '))
      value: archipelago.config.get(property)
      onChange: (e) ->
        # archipelago.config.set(property, e.target.value)
    )

  select: (property, schema) ->
    React.createElement(
      Select
      key: property
      datakey: property
      label: schema.title || titleize(decamelize(property, ' '))
      value: archipelago.config.get(property)
      options: schema.enum
      onChange: (e) ->
        # archipelago.config.set(field, e.target.value)
    )

  switch: (property, schema) ->
    React.createElement(
      Switch
      key: property
      datakey: property
      checked: archipelago.config.get(property)
      label: schema.title || titleize(decamelize(property, ' '))
      onChange: (e) ->
        # archipelago.config.set(field, e.target.checked)
    )

  color: (property, schema) ->
    React.createElement(
      'div'
      className: 'color-container'
      key: property
      style: if @state.activeField == property then zIndex: 2
      @colorBackdrop(property)
      @colorText(property, schema)
    )

  colorBackdrop: (property) ->
    return unless @state.activeField is property

    React.createElement(
      'div'
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
      onClick: () =>
        @setState(activeField: null)
    )

  colorText: (property, schema) ->
    React.createElement(
      TextField
      datakey: property
      label: schema.title || titleize(decamelize(property))
      value: archipelago.config.get(property)
      onClick: (e) =>
        @setState(activeField: property)
      onChange: (e) ->
        # archipelago.config.set(property, e.target.value)
      @colorInput(property)
    )

  colorInput: (property) ->
    return unless @state.activeField is property

    React.createElement(
      'div'
      className: 'color-picker'
      React.createElement(
        ChromePicker
        color: archipelago.config.get(property)
        onChangeComplete: (color) ->
          rgba = "rgba(#{Object.values(color.rgb).join(",")})"
          # archipelago.config.set(field, rgba)
      )
    )

  _bindListeners: ->
    @state = activeField: null
    for property, schema of @props.properties
      if property != 'seperator'
        @state[property] = archipelago.config.get(property)
        archipelago.config.onDidChange property, (newValue) =>
          @setState("#{property}": newValue)
