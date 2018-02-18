React                         = require 'react'
{ TextField, Select, Switch } = require 'rmwc'

module.exports =
class GeneralOptions extends React.Component
  constructor: (props) ->
    super(props)
    @fieldRenderers =
      text: @text.bind(this)
      select: @select.bind(this)
      switch: @switch.bind(this)

    @_bindListeners()

  render: ->
    React.createElement(
      'archipelago-general-options'
      ref: @props.innerRef
      @make field for field in @fields()
    )

  fields: ->
    [
      'fontFamily', 'fontSize', 'lineHeight', 'letterSpacing', 'fontWeight',
      'fontWeightBold', 'seperator', 'cursorStyle', 'cursorBlink', 'seperator',
      'bellSound', 'bellStyle', 'seperator', 'shell', 'shellArgs', 'scrollback',
      'tabStopWidth', 'macOptionIsMeta', 'seperator', 'allowTransparency',
      'vibrancy', 'seperator', 'copyOnSelect', 'rightClickSelectsWord',
      'seperator'
    ]

  make: (field) ->
    if field is 'seperator'
      React.createElement('div', key: Math.random(), className: 'seperator')
    else
      schema = archipelago.config.getSchemaFor(field)
      @fieldRenderers[schema.input].call(this, field, schema)

  text: (field, schema) ->
    React.createElement(
      TextField
      key: field
      datakey: field
      label: schema.label
      value: @state[field]
      onChange: (e) ->
        archipelago.config.set(field, e.target.value)
    )

  select: (field, schema) ->
    React.createElement(
      Select
      key: field
      datakey: field
      label: schema.label
      value: @state[field]
      options: schema.options
      disabled: schema.disabled
      onChange: (e) ->
        archipelago.config.set(field, e.target.value)
    )

  switch: (field, schema) ->
    React.createElement(
      Switch
      key: field
      datakey: field
      checked: @state[field]
      label: schema.label
      onChange: (e) ->
        archipelago.config.set(field, e.target.checked)
    )

  _bindListeners: ->
    @state = {}
    @fields().forEach (field) =>
      if field != 'seperator'
        @state[field] = archipelago.config.get(field)
        archipelago.config.onDidChange field, (newValue) =>
          @setState("#{field}": newValue)
