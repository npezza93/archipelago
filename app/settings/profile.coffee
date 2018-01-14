React = require 'react'

module.exports =
class Profile extends React.Component
  constructor: (props) ->
    super(props)
    @state =
      editMode: false
      name: props.profile.name

  render: ->
    React.createElement(
      'archipelago-profile',
      class: if @props.activeProfile == @props.profile.id then 'active'
      onDoubleClick: () =>
        @setState(editMode: true)
      onClick: () =>
        @props.setActiveProfile(@props.profile.id)
      @textOrInput()
      @removeProfile()
    )

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
        selector = "profiles.#{@props.profile.id}.name"
        value = e.target.value

        archipelago.config.set(selector, value)
        @setState(name: value)
    )

  removeProfile: ->
    if Object.keys(archipelago.config.get('profiles', false)).length > 1
      React.createElement(
        'span'
        className: 'profile-remove'
        onClick: (e) =>
          e.stopPropagation()
          @props.removeProfile(@props.profile.id)
        '\u00D7'
      )

  textOrInput: ->
    if @state.editMode
      @input()
    else
      @state.name
