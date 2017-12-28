React = require('react')

module.exports =
class OptionsHeader extends React.Component
  render: ->
    React.createElement(
      'archipelago-options-header'
      {}
      React.createElement(
        'div', { position: @props.preferences }, 'Preferences'
      )
      React.createElement('div', { position: @props.theme }, 'Theme')
      React.createElement('div', { position: @props.keyboard }, 'Keybindings')
    )
