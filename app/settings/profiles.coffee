React   = require 'react'
Profile = require './profile'

module.exports =
class Profiles extends React.Component
  constructor: (props) ->
    super(props)
    @state =
      activeProfileId: archipelago.config.activeProfileId
      profileIds: archipelago.config.profileIds

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
        profileId = archipelago.config.createProfile()

        @setState(
          activeProfileId: profileId,
          profileIds: [...@state.profileIds, profileId]
        )

      'Add New Profile'
    )

  removeProfile: (id) ->
    archipelago.config.destroyProfile(id)

    archipelago.config.validateActiveProfile()

  setActiveProfileId: (id) ->
    @setState(activeProfileId: id)

    archipelago.config.setActiveProfileId(id)

  _bindListener: ->
    archipelago.config.on 'did-change', () =>
      profileIdsMatch =
        archipelago.config.profileIds.length == @state.profileIds.length &&
          archipelago.config.profileIds.every (id, i) =>
            id == @state.profileIds[i]

      activeProfileIdMatch =
          archipelago.config.activeProfileId == @state.activeProfileId

      if !profileIdsMatch || !activeProfileIdMatch
        archipelago.config.validateActiveProfile()

        @setState(
          activeProfileId: archipelago.config.activeProfileId
          profileIds: archipelago.config.profileIds
        )
