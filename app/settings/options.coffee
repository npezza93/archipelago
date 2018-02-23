React          = require 'react'
Waypoint       = require 'react-waypoint'
OptionsHeader  = require './options_header'
GeneralOptions = require './general_options'
Keybindings    = require './keybindings'

module.exports =
class Options extends React.Component
  constructor: (props) ->
    super(props)
    @scopes = archipelago.config.schema.groupByScope().settings

    @state =
      headers: { preferences: 0, theme: 1, keybinding: 2 }

  render: ->
    React.createElement(
      'archipelago-options'
      {}
      React.createElement(OptionsHeader, @state.headers)
      React.createElement(
        GeneralOptions, properties: @scopes.preferences, key: 'preferences'
      )
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
      React.createElement(
        GeneralOptions,
        properties: @scopes[scope], key: scope
      )
    )

  decrementWaypoint: ->
    headerState = {}
    for header, position of @state.headers
      headerState[header] = @state.headers[header] - 1

    @setState(headers: headerState)

  incrementWaypoint: ->
    headerState = {}
    for header of @state.headers
      headerState[header] = @state.headers[header] + 1

    @setState(headers: headerState)
