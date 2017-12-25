React = require('react')
OptionsHeader  = require('./options_header')
GeneralOptions = require('./general_options')
ConfigFile = require('../utils/config_file')

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
      React.createElement(GeneralOptions, { updateGeneralOption: @updateGeneralOption.bind(this), ...@state })
    )

  bindListener: ->
    @_configFile.on 'change', () =>
      if @activeProfile != @_configFile.contents().activeProfile
        @activeProfile = @_configFile.contents().activeProfile
        @setState(@_configFile.activeSettings())

  updateGeneralOption: (e) ->
    activeProfileKey = "profiles.#{@_configFile.contents().activeProfile}."
    activeProfileKey += e.target.getAttribute('datakey')

    if e.target.type == 'checkbox'
      value = e.target.checked
    else
      value = e.target.value

    console.log activeProfileKey, value
    @_configFile.update(activeProfileKey, value)

    @setState("#{e.target.getAttribute('datakey')}": value)
