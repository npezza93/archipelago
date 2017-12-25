React = require('react')

module.exports =
class OptionsHeader extends React.Component
  render: ->
    React.createElement(
      'archipelago-options-header'
      {}
      'Preferences'
    )
