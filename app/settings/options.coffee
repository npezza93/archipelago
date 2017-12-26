React = require('react')
OptionsHeader  = require('./options_header')
GeneralOptions = require('./general_options')
ThemeOptions = require('./theme_options')
KeyboardOptions = require('./keyboard_options')
ConfigFile = require('../utils/config_file')
nestedProperty = require('nested-property')
Waypoint = require('react-waypoint')

module.exports =
class Options extends React.Component
  constructor: (props) ->
    super(props)
    @_configFile = new ConfigFile()
    @activeProfile = @_configFile.contents().activeProfile
    @state = @_configFile.activeSettings()
    @bindListener()

  render: ->
    React.createElement(
      'archipelago-options'
      {}
      React.createElement(OptionsHeader)
      React.createElement(
        Waypoint
        onEnter: () =>
          console.log 'general entered'
        onLeave: () =>
          console.log 'general left'
        React.createElement(GeneralOptions, { updateOption: @updateOption.bind(this), ...@state })
      )
      React.createElement(
        Waypoint
        onEnter: () =>
          console.log 'theme entered'
        onLeave: () =>
          console.log 'theme left'
        React.createElement(ThemeOptions, { updateOption: @updateOption.bind(this), ...@state })
      )
      React.createElement(
        Waypoint
        onEnter: () =>
          console.log 'keyboard entered'
        onLeave: () =>
          console.log 'keyboard left'
        React.createElement(KeyboardOptions, { updateOption: @updateOption.bind(this), ...@state })
      )
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
