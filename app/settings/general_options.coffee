React = require('react')
{ TextField, TextFieldHelperText, Select, Switch } = require('rmwc')

module.exports =
class GeneralOptions extends React.Component
  render: ->
    React.createElement(
      'archipelago-general-options'
      ref: @props.innerRef
      @text('fontFamily', 'Font Family')
      @text('fontSize', 'Font Size', true)
      @text('lineHeight', 'Line Height')
      @text('letterSpacing', 'Letter Spacing', true)

      React.createElement('div', className: 'seperator')

      @select('cursorStyle', 'Choose a cursor style', {
        'block': 'Block', 'underline': 'Underline', 'bar': 'Bar'
      })
      @switch('cursorBlink', 'Blink cursor')

      React.createElement('div', className: 'seperator')

      @text('bellSound', 'Bell sound (URL or URI)')
      @select('bellStyle', 'Choose a bell style', {
        'none': 'None', 'visual': 'Visual', 'sound': 'Sound', 'both': 'Both'
      })

      React.createElement('div', className: 'seperator')

      @text('shell', 'Shell to run (i.e. /usr/local/bin/fish)')
      @text('shellArgs', 'Shell Arguments (comma seperated)')
      @text('scrollback', 'Scrollback')
      @text('tabStopWidth', 'Tab Stop Width')

      React.createElement('div', className: 'seperator')

      React.createElement(
        'div'
        style: {
          display: 'flex'
          flexDirection: 'column'
          fontSize: '13px'
          color: 'rgba(0, 0, 0, 0.5)'
          width: '100%'
          gridColumn: 'span 2'
        }
        @select('vibrancy', 'Vibrancy', {
          'light': 'light', 'medium-light': 'medium-light', 'dark': 'dark',
          'ultra-dark': 'ultra-dark'
        }, true)
        'Transparency will be available coming soon!'
      )
      @switch('copyOnSelect', 'Copy on select')

      React.createElement('div', className: 'seperator')
    )

  text: (key, label, int) ->
    React.createElement(
      TextField
      datakey: key
      label: label
      value: if int then parseInt(@props[key]) else @props[key]
      onChange: (e) =>
        @props.updateOption(key, e.target.value)
    )

  select: (key, label, options, disabled) ->
    React.createElement(
      Select
      datakey: key
      label: label
      value: @props[key]
      options: options
      disabled: disabled
      onChange: (e) =>
        @props.updateOption(key, e.target.value)
    )

  switch: (key, label) ->
    React.createElement(
      Switch
      datakey: key
      checked: @props[key]
      label: label
      onChange: (e) =>
        @props.updateOption(key, e.target.checked)
    )
