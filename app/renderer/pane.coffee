React    = require 'react'
Terminal = require './terminal'

module.exports =
class Pane extends React.Component
  render: ->
    React.createElement(
      'archipelago-pane'
      class: if @props.currentTabId != @props.id then 'hidden'
      @props.sessions.render(@props)
    )
