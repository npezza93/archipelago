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
      React.createElement(
        Waypoint
        onEnter: () =>
          @setState(header: { preferences: -1, theme: 0,  keybinding: 1 })
        onLeave: () =>
          unless @header.keybinding == 'entered'
            @setState(header: { preferences: 0, theme: 1,  keybinding: 2 })
        React.createElement(ThemeOptions)
      )
      React.createElement(
        Waypoint
        onEnter: () =>
          @header.keybinding = 'entered'
          @setState(header: { preferences: -2, theme: -1,  keybinding: 0 })
        onLeave: () =>
          @header.keybinding = 'left'
          @setState(header: { preferences: -1, theme: 0,  keybinding: 1 })
        React.createElement(Keybindings)
      )
    )
