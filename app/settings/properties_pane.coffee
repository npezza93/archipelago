React             = require 'react'
Waypoint          = require 'react-waypoint'
Header            = require './header'
Schema = require('../configuration/schema')
PropertiesSection = require './properties-section'

module.exports =
class PropertiesPane extends React.Component
  constructor: (props) ->
    super(props)
    @scopes = (new Schema()).propertiesGroupedBySetting()

    @state = headings: {}

    @headings = Object.keys(@scopes).filter((header) -> header isnt 'profile')
    @state.headings[header] = i for header, i in @headings

  render: ->
    React.createElement(
      'archipelago-properties-pane'
      {}
      React.createElement(Header, headings: @state.headings)
      for heading in @headings
        @withWaypoint(heading)
    )

  withWaypoint: (scope) ->
    React.createElement(
      Waypoint
      key: scope
      topOffset: '20px'
      bottomOffset: '20px'
      onPositionChange: (waypoint) =>
        return if waypoint.currentPosition isnt 'inside'

        enteringIndex = @headings.indexOf(scope)
        headerState = {}
        for heading, index in @headings
          if index is enteringIndex
            headerState[heading] = 0
          else
            position = index - enteringIndex
            position = 1 if position > 1
            position = -2 if position < -2
            headerState[heading] = position

        @setState(headings: headerState)
      React.createElement(PropertiesSection, properties: @scopes[scope])
    )
