React          = require 'react'
nestedProperty = require 'nested-property'
Waypoint       = require 'react-waypoint'
OptionsHeader  = require './options_header'
GeneralOptions = require './general_options'
ThemeOptions   = require './theme_options'
Keybindings    = require './keybindings'
AsciiDialog    = require './ascii_dialog'

module.exports =
class Options extends React.Component
  constructor: (props) ->
    super(props)
    @header = {}
    activeProfileId = archipelago.config.get('activeProfile', false)
    @state = {
      header: { preferences: 0, theme: 1, keybinding: 2 },
      ...archipelago.config.get("profiles.#{activeProfileId}", false)
    }
    @bindListener()

  render: ->
    React.createElement(
      'archipelago-options'
      {}
      React.createElement(OptionsHeader, @state.header)
      React.createElement(
        GeneralOptions, { updateOption: @updateOption.bind(this), ...@state }
      )
      React.createElement(
        Waypoint
        onEnter: () =>
          @setState(header: { preferences: -1, theme: 0,  keybinding: 1 })
        onLeave: () =>
          unless @header.keybinding == 'entered'
            @setState(header: { preferences: 0, theme: 1,  keybinding: 2 })
        React.createElement(
          ThemeOptions, { updateOption: @updateOption.bind(this), ...@state }
        )
      )
      React.createElement(
        Waypoint
        onEnter: () =>
          @header.keybinding = 'entered'
          @setState(header: { preferences: -2, theme: -1,  keybinding: 0 })
        onLeave: () =>
          @header.keybinding = 'left'
          @setState(header: { preferences: -1, theme: 0,  keybinding: 1 })
        React.createElement(
          Keybindings, { updateOption: @updateOption.bind(this), ...@state }
        )
      )
      React.createElement(AsciiDialog)
    )

  bindListener: ->
    archipelago.config.onDidChange(
      'activeProfile'
      (newActiveProfileId) =>
        @setState(archipelago.config.get("profiles.#{newActiveProfileId}", false))
      false
    )

  updateOption: (key, value) ->
    archipelago.config.set(key, value)

    tempState = {}
    Object.assign(tempState, @state)

    nestedProperty.set(tempState, key, value)
    @setState(tempState)
