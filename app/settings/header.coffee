React      = require 'react'

module.exports =
class Header extends React.Component
  render: ->
    React.createElement(
      'archipelago-header'
      {}
      for heading, headingPosition of @props.headings
        React.createElement(
          'div'
          key: heading
          position: headingPosition
          heading.titleize
        )
    )
