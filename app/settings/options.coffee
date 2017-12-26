React = require('react')
OptionsHeader  = require('./options_header')
GeneralOptions = require('./general_options')
ThemeOptions = require('./theme_options')
KeyboardOptions = require('./keyboard_options')
ConfigFile = require('../utils/config_file')
nestedProperty = require('nested-property')

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
      React.createElement(GeneralOptions, { updateOption: @updateOption.bind(this), ...@state })
      React.createElement(ThemeOptions, { updateOption: @updateOption.bind(this), ...@state })
      React.createElement(KeyboardOptions, { updateOption: @updateOption.bind(this), ...@state })
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
