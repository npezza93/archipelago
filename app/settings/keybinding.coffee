React         = require 'react'
{ TextField } = require 'rmwc'

module.exports =
class Keybinding extends React.Component
  render: ->
    React.createElement(
      'div'
      className: 'keybinding-container'
      @accelerator(@props.accelerator)
      @command(@props.command)
      React.createElement(
        'div'
        className: 'remove-keybinding'
        onClick: () =>
          @props.removeKeybinding(@props.id)
        '\u00D7'
      )
    )

  accelerator: (accelerator) ->
    React.createElement(
      TextField
      label: 'Keystroke'
      value: accelerator
      onChange: (e) =>
        @props.updateKeystroke(@props.id, e.target.value)
    )

  command: (command) ->
    React.createElement(
      TextField
      label: 'Command'
      value: command.join(',')
      onChange: (e) =>
        @props.updateCommand(@props.id, e.target.value.split(','))
    )
