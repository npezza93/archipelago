React = require 'react'

module.exports =
class Header extends React.Component
  constructor: (props) ->
    super(props)
    @headings =
      preferences: 'Preferences'
      theme: 'Theme'
      keybinding: 'Keybindings'

  render: ->
    React.createElement(
      'archipelago-header'
      {}
      for headingKey, heading of @headings
        React.createElement(
          'div'
          key: headingKey
          position: @props[headingKey]
          heading
        )
    )
