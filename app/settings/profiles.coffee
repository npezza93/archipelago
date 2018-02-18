React   = require 'react'
Profile = require './profile'

module.exports =
class Profiles extends React.Component
  constructor: (props) ->
    super(props)
    @state =
      activeProfileId: archipelago.config.activeProfileId
      profileIds: archipelago.config.profileIds

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
    remainingProfileIds = archipelago.config.destroyProfile(id)

    newActiveProfileId = @resetActiveProfile(id)

    @setState(
      activeProfileId: newActiveProfileId || archipelago.config.activeProfileId
      profileIds: remainingProfileIds
    )

  resetActiveProfile: (id) ->
    if archipelago.config.activeProfileId == id
      activeProfileId = archipelago.config.profileIds[0]

      archipelago.config.setActiveProfileId(activeProfileId)

      activeProfileId

  setActiveProfileId: (id) ->
    archipelago.config.setActiveProfileId(id)

    @setState(activeProfileId: id)
