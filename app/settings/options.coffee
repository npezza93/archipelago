React = require('react')
OptionsHeader  = require('./options_header')
GeneralOptions = require('./general_options')
ThemeOptions = require('./theme_options')
Keybindings = require('./keybindings')
ConfigFile = require('../utils/config_file')
nestedProperty = require('nested-property')
Waypoint = require('react-waypoint')
AsciiDialog = require('./ascii_dialog')

module.exports =
class Options extends React.Component
  constructor: (props) ->
    super(props)
    @_configFile = new ConfigFile()
    @activeProfile = @_configFile.contents().activeProfile
    @header = {}
    @state = {
      header: { preferences: 0, theme: 1,  keybinding: 2 },
      ...@_configFile.activeSettings()
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
    @_configFile.on 'change', () =>
      if @activeProfile != @_configFile.contents().activeProfile
        @activeProfile = @_configFile.contents().activeProfile
        @setState(@_configFile.activeSettings())

  updateOption: (key, value) ->
    optionKey = "profiles.#{@_configFile.contents().activeProfile}."
    optionKey += key

    @_configFile.update(optionKey, value)
    tempState = {}
    Object.assign(tempState, @state)

    nestedProperty.set(tempState, key, value)
    @setState(tempState)
