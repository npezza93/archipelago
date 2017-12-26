React = require('react')
{ TextField } = require('rmwc')

module.exports =
class KeyboardOptions extends React.Component
  render: ->
    React.createElement(
      'archipelago-keyboard-options'
      ref: @props.innerRef
      @props.keyboard[process.platform].map (hotkey) =>
        React.createElement(
          'div'
          key: hotkey.accelerator
          React.createElement('div', {}, hotkey.accelerator)
          React.createElement('div', {}, JSON.stringify(hotkey.command))
        )
    )
