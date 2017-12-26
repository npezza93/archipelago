React = require('react')
{ TextField } = require('rmwc')

module.exports =
class KeyboardOptions extends React.Component
  render: ->
    React.createElement(
      'archipelago-keyboard-options'
      {}
      @props.keyboard[process.platform].map (hotkey) =>
        React.createElement(
          'div'
          {},
          React.createElement('div', {}, hotkey.accelerator)
          React.createElement('div', {}, JSON.stringify(hotkey.command))
        )
    )
