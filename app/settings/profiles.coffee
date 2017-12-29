React      = require('react')
Profile    = require('./profile')
ConfigFile = require('../utils/config_file')

module.exports =
class Profiles extends React.Component
  constructor: (props) ->
    super(props)
    @_configFile = new ConfigFile()

    @state = {
      activeProfile: @_configFile.contents().activeProfile
      profiles: Object.values(@_configFile.contents().profiles)
    }

  render: ->
    React.createElement(
      'archipelago-profiles'
      null
      React.createElement('div', className: 'profile-header', 'Profiles')
      React.createElement(
        'div'
        className: 'profile-list'
        @state.profiles.map (profile) =>
          React.createElement(
            Profile
            profile: profile
            activeProfile: @state.activeProfile
            key: profile.id
            configFile: @_configFile
            removeProfile: @removeProfile.bind(this)
            setActiveProfile: @setActiveProfile.bind(this)
          )
      )
      React.createElement(
        'div'
        className: 'new-profile'
        onClick: @createProfile.bind(this)
        'Add New Profile'
      )
    )

  settings: ->
    @_configFile.contents()

  setActiveProfile: (id) ->
    @_configFile.update('activeProfile', id)

    @setState(activeProfile: id)

  removeProfile: (id) ->
    settings = @settings()
    tempState = {}
    Object.assign(tempState, settings)
    if tempState.activeProfile == id
      tempState.activeProfile = Object.keys(tempState.profiles)[0]

    delete tempState.profiles[id]
    @_configFile.write(tempState)

    @setState(
      activeProfile: tempState.activeProfile,
      profiles: Object.values(settings.profiles)
    )

  createProfile: ->
    settings = @settings()
    id = Object.keys(settings.profiles || {}).length + 1

    settings.profiles ?= {}
    settings.profiles[id] = ConfigFile.defaultProfile(id)
    settings.activeProfile = id
    @_configFile.write(settings)

    @setState(activeProfile: id, profiles: Object.values(settings.profiles))
