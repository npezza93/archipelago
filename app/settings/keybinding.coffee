React         = require 'react'
{ TextField } = require 'rmwc'

module.exports =
class Keybinding extends React.Component
  render: ->
    React.createElement(
      'div'
      className: 'keybinding-container'
      @keystroke(@props.accelerator)
      @command(@props.command)
      @remove()
    )

  command: (command) ->
    React.createElement(
      TextField
      label: 'Command'
      value: command
      onChange: (e) =>
        @props.updateCommand(@props.id, e.target.value)
    )

  keystroke: (accelerator) ->
    React.createElement(
      TextField
      label: 'Keystroke'
      value: accelerator
      onChange: (e) =>
        @props.updateKeystroke(@props.id, e.target.value)
    )

  remove: ->
    React.createElement(
      'div'
      className: 'remove-keybinding'
      onClick: () =>
        @props.removeKeybinding(@props.id)
      '\u00D7'
    )
