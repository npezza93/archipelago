React             = require 'react'
Waypoint          = require 'react-waypoint'
Header            = require './header'
PropertiesSection = require './properties_section'
Keybindings       = require './keybindings'

module.exports =
class PropertiesPane extends React.Component
  constructor: (props) ->
    super(props)
    @scopes = archipelago.config.schema.settingsScopes()

    @state = headings: {}

    headings = Object.keys(@scopes).filter((header) -> header isnt 'profile')
    @state.headings[header] = i for header, i in headings

  render: ->
    React.createElement(
      'archipelago-properties-pane'
      {}
      React.createElement(Header, headings: @state.headings)
      React.createElement(PropertiesSection, properties: @scopes.preferences)
      @withWaypoint('theme')
    )

  withWaypoint: (scope) ->
    React.createElement(
      Waypoint
      key: scope
      onEnter: () =>
        @decrementWaypoint()
      onLeave: () =>
        @incrementWaypoint()
      React.createElement(PropertiesSection, properties: @scopes[scope])
    )

  decrementWaypoint: ->
    headerState = {}
    for header, position of @state.headings
      headerState[header] = @state.headings[header] - 1

    @setState(headings: headerState)

  incrementWaypoint: ->
    headerState = {}
    for header of @state.headings
      headerState[header] = @state.headings[header] + 1

    @setState(headings: headerState)
