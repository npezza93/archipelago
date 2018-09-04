React   = require 'react'
Profile = require './profile'

module.exports =
class Profiles extends React.Component
  constructor: (props) ->
    super(props)
    @state =
      activeProfileId: archipelago.profileManager.activeProfileId
      profileIds: archipelago.profileManager.profileIds

    @_bindListener()

  render: ->
    React.createElement(
      'archipelago-profiles'
      {}
      @header()
      @list()
      @newProfile()
    )

  header: ->
    React.createElement('div', className: 'profile-header', 'Profiles')

  list: ->
    React.createElement(
      'div'
      className: 'profile-list'
      for profileId in @state.profileIds
        React.createElement(
          Profile
          profileId: parseInt(profileId)
          activeProfileId: parseInt(@state.activeProfileId)
          key: profileId
          removeProfile: @removeProfile.bind(this)
          setActiveProfileId: @setActiveProfileId.bind(this)
        )
    )

  newProfile: ->
    React.createElement(
      'div'
      className: 'new-profile'
      onClick: =>
        profile = archipelago.profileManager.create()

        @setState(
          activeProfileId: profile.id,
          profileIds: [...@state.profileIds, profile.id]
        )

      'Add New Profile'
    )

  removeProfile: (id) ->
    profile = archipelago.profileManager.find(id)
    profile.destroy()

    archipelago.profileManager.validate()

  setActiveProfileId: (id) ->
    @setState(activeProfileId: id)

    archipelago.profileManager.activeProfileId = id

  _bindListener: ->
    archipelago.config.on 'did-change', () =>
      profileIds = archipelago.profileManager.profileIds
      activeProfile = archipelago.profileManager.activeProfile()

      profileIdsMatch =
        profileIds.length == @state.profileIds.length &&
          archipelago.profileManager.profileIds.every (id, i) =>
            id == @state.profileIds[i]

      activeProfileIdMatch = activeProfile.id == @state.activeProfileId

      if !profileIdsMatch || !activeProfileIdMatch
        archipelago.profileManager.validate()

        @setState(
          activeProfileId: activeProfile.id
          profileIds: profileIds
        )
