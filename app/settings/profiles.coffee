React   = require 'react'
Profile = require './profile'

module.exports =
class Profiles extends React.Component
  constructor: (props) ->
    super(props)
    @state =
      activeProfile: archipelago.config.get('activeProfile', false)
      profiles: Object.values(archipelago.config.get('profiles', false))

  render: ->
    React.createElement(
      'archipelago-profiles'
      {}
      @header()
      @list()
      @newProfile()
    )

  createProfile: ->
    tempProfiles = @dupeProfiles()

    id = Math.max(...Object.keys(tempProfiles)) + 1
    tempProfiles[id] = archipelago.config.defaultProfile(id)
    archipelago.config.set('profiles', tempProfiles, false)
    archipelago.config.set('activeProfile', id, false)

    @setState(activeProfile: id, profiles: Object.values(tempProfiles))

  dupeProfiles: ->
    tempProfiles = {}

    Object.assign(tempProfiles, archipelago.config.get('profiles', false))

    tempProfiles

  header: ->
    React.createElement('div', className: 'profile-header', 'Profiles')

  list: ->
    React.createElement(
      'div'
      className: 'profile-list'
      for profile in @state.profiles
        React.createElement(
          Profile
          profile: profile
          activeProfile: @state.activeProfile
          key: profile.id
          removeProfile: @removeProfile.bind(this)
          setActiveProfile: @setActiveProfile.bind(this)
        )
    )

  newProfile: ->
    React.createElement(
      'div'
      className: 'new-profile'
      onClick: @createProfile.bind(this)
      'Add New Profile'
    )

  removeProfile: (id) ->
    tempProfiles = @dupeProfiles()

    delete tempProfiles[id]
    archipelago.config.set('profiles', tempProfiles, false)

    @resetActiveProfile(id)

    @setState(
      activeProfile: archipelago.config.get('activeProfile', false)
      profiles: Object.values(tempProfiles)
    )

  resetActiveProfile: (id) ->
    if archipelago.config.get('activeProfile', false) == id
      activeProfile = Object.keys(archipelago.config.get('profiles', false))[0]

      archipelago.config.set('activeProfile', parseInt(activeProfile), false)

      activeProfile

  setActiveProfile: (id) ->
    archipelago.config.set('activeProfile', id, false)

    @setState(activeProfile: id)
