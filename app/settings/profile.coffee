React = require 'react'

module.exports =
class Profile extends React.Component
  constructor: (props) ->
    super(props)
    @state =
      editMode: false
      name: archipelago.profileManager.find(props.profileId).name

    @_bindListener()

  render: ->
    React.createElement(
      'archipelago-profile',
      class: if @props.activeProfileId == @props.profileId then 'active'
      onDoubleClick: () =>
        @setState(editMode: true)
      onClick: () =>
        @props.setActiveProfileId(@props.profileId)
      @textOrInput()
      @removeProfile()
    )

  textOrInput: ->
    if @state.editMode
      @input()
    else
      @state.name

  input: ->
    React.createElement(
      'input'
      autoFocus: true
      type: 'text'
      value: @state.name
      onFocus: (e) ->
        e.target.select()
      onBlur: () =>
        @setState(editMode: false)
      onChange: (e) =>
        newName = e.target.value

        profile = archipelago.profileManager.find(@props.profileId)
        profile.name = newName

        @setState(name: newName)
    )

  removeProfile: ->
    return if archipelago.profileManager.profileIds.length <= 1

    React.createElement(
      'span'
      className: 'profile-remove'
      onClick: (e) =>
        e.stopPropagation()
        @props.removeProfile(@props.profileId)
      '\u00D7'
    )

  _bindListener: ->
    archipelago.config.on 'did-change', (newContents) =>
      profile = archipelago.profileManager.find(props.profileId)

      nameMatch = profile.name == @state.name

      unless nameMatch
        @setState(name: profile.name)
