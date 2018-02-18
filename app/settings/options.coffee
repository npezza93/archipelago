React          = require 'react'
Waypoint       = require 'react-waypoint'
OptionsHeader  = require './options_header'
GeneralOptions = require './general_options'
ThemeOptions   = require './theme_options'
Keybindings    = require './keybindings'

module.exports =
class Options extends React.Component
  constructor: (props) ->
    super(props)
    @header = {}

    @state =
      header: { preferences: 0, theme: 1, keybinding: 2 }

  render: ->
    React.createElement(
      'archipelago-options'
      {}
      React.createElement(OptionsHeader, @state.header)
      React.createElement(GeneralOptions)
      @withWaypoint(ThemeOptions)
      @withWaypoint(Keybindings)
    )

  withWaypoint: (element) ->
    React.createElement(
      Waypoint
      onEnter: () =>
        @decrementWaypoint()
      onLeave: () =>
        @incrementWaypoint()
      React.createElement(element)
    )

  decrementWaypoint: ->
    headerState = {}
    Object.keys(@state.header).forEach (key) =>
      headerState[key] = @state.header[key] - 1

    @setState(header: headerState)

  incrementWaypoint: ->
    headerState = {}
    Object.keys(@state.header).forEach (key) =>
      headerState[key] = @state.header[key] + 1

    @setState(header: headerState)
