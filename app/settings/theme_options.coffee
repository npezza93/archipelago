{ TextField }    = require 'rmwc'
{ ChromePicker } = require 'react-color'
React            = require 'react'

module.exports =
class ThemeOptions extends React.Component
  constructor: (props) ->
    super(props)
    @state = activeField: null

    @_bindListeners()

  render: ->
    React.createElement(
      'archipelago-theme-options'
      ref: @props.innerRef
      @make field for field in @fields()
    )

  color: (field, schema) ->
    React.createElement(
      'div'
      className: 'color-container'
      key: field
      style: if @state.activeField == field then zIndex: 2
      @colorBackdrop(field)
      @input(field, schema)
    )

  colorBackdrop: (field) ->
    return unless @state.activeField is field

    React.createElement(
      'div'
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
      onClick: () =>
        @setState(activeField: null)
    )

  colorInput: (field) ->
    return unless @state.activeField is field

    React.createElement(
      'div'
      className: 'color-picker'
      React.createElement(
        ChromePicker
        color: @state[field]
        onChangeComplete: (color) ->
          rgba = "rgba(#{Object.values(color.rgb).join(",")})"
          archipelago.config.set(field, rgba)
      )
    )

  fields: ->
    [
      'theme.foreground', 'theme.background', 'windowBackground', 'tabColor',
      'tabBorderColor', 'theme.selection', 'theme.cursor', 'theme.cursorAccent',
      'theme.red', 'theme.brightRed', 'theme.green', 'theme.brightGreen',
      'theme.yellow', 'theme.brightYellow', 'theme.magenta',
      'theme.brightMagenta', 'theme.cyan', 'theme.brightCyan', 'theme.blue',
      'theme.brightBlue', 'theme.white', 'theme.brightWhite', 'theme.black',
      'theme.brightBlack',
    ]

  input: (field, schema) ->
    React.createElement(
      TextField
      datakey: field
      label: schema.label
      value: @state[field]
      onClick: (e) =>
        @setState(activeField: field)
      onChange: (e) ->
        archipelago.config.set(field, e.target.value)
      @colorInput(field)
    )

  make: (field) ->
    schema = archipelago.config.getSchemaFor(field)
    @color(field, schema)

  _bindListeners: ->
    @fields().forEach (field) =>
      if field != 'seperator'
        @state[field] = archipelago.config.get(field)
        archipelago.config.onDidChange field, (newValue) =>
          @setState("#{field}": newValue)
