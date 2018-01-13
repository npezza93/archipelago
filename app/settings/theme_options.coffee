{ TextField, FormField } = require 'rmwc'
{ ChromePicker }         = require 'react-color'
React                    = require 'react'
nestedProperty           = require 'nested-property'

module.exports =
class ThemeOptions extends React.Component
  constructor: (props) ->
    super(props)
    @state = activeField: null

  render: ->
    React.createElement(
      'archipelago-theme-options'
      ref: @props.innerRef
      @text('theme.foreground', 'Foreground')
      @text('theme.background', 'Terminal Background')
      @text('windowBackground', 'Window Background')
      @text('tabColor', 'Tab Color')
      @text('tabBorderColor', 'Tab Border Color')
      @text('theme.selection', 'Selection')
      @text('theme.cursor', 'Cursor')
      @text('theme.cursorAccent', 'Cursor Accent')
      @text('theme.red', 'Red')
      @text('theme.brightRed', 'Bright Red')
      @text('theme.green', 'Green')
      @text('theme.brightGreen', 'Bright Green')
      @text('theme.yellow', 'Yellow')
      @text('theme.brightYellow', 'Bright Yellow')
      @text('theme.magenta', 'Magenta')
      @text('theme.brightMagenta',  'Bright Magenta')
      @text('theme.cyan', 'Cyan')
      @text('theme.brightCyan', 'Bright Cyan')
      @text('theme.blue', 'Blue')
      @text('theme.brightBlue', 'Bright Blue')
      @text('theme.white', 'White')
      @text('theme.brightWhite', 'Bright White')
      @text('theme.black', 'Black')
      @text('theme.brightBlack', 'Bright Black')
    )

  text: (key, label) ->
    React.createElement(
      'div'
      className: 'color-container'
      style: if @state.activeField == key then { zIndex: 2 }
      if @state.activeField == key
        React.createElement(
          'div'
          style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
          onClick: () =>
            @setState(activeField: null)
        )
      React.createElement(
        TextField
        datakey: key
        label: label
        value: nestedProperty.get(@props, key)
        onClick: (e) =>
          @setState(activeField: key)
        onChange: (e) =>
          @props.updateOption(key, e.target.value)
        if @state.activeField == key
          React.createElement(
            'div'
            className: 'color-picker'
            React.createElement(
              ChromePicker
              color: nestedProperty.get(@props, key)
              onChange: (color) =>
                rgba = "rgba(#{Object.values(color.rgb).join(",")})"
                @props.updateOption(key, rgba)
            )
          )
      )
    )
