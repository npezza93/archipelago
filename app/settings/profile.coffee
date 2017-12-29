React = require('react')

module.exports =
class Profile extends React.Component
  constructor: (props) ->
    super(props)
    @state = { editMode: false, name: props.profile.name }

  render: ->
    React.createElement(
      'archipelago-profile',
      tabIndex: 1
      class: if @props.activeProfile == @props.profile.id then 'active'
      onDoubleClick: (e) =>
        @setState(editMode: true)
      onClick: (e) =>
        @props.setActiveProfile(@props.profile.id)
      @textOrInput()
      React.createElement(
        'span'
        className: 'profile-remove'
        onClick: (e) =>
          @props.removeProfile(@props.profile.id)
          e.stopPropagation()
        '\u00D7'
      )
    )

  textOrInput: ->
    return @state.name unless @state.editMode

    @input()

  input: ->
    React.createElement(
      'input'
      autoFocus: true
      type: 'text'
      value: @state.name
      onFocus: (e) ->
        e.target.select()
      onBlur: (e) =>
        @setState(editMode: false)
      onChange: (e) =>
        @props.configFile.update(
          "profiles.#{@props.profile.id}.name", e.target.value
        )
        @setState(name: e.target.value)
    )
