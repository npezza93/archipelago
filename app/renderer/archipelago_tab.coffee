React = require('react')

module.exports =
class ArchipelagoTab extends React.Component
  constructor: (props) ->
    super(props)
    @state = {}

  render: ->
    React.createElement('archipelago-tab', {
      class: if @props.active then 'active' else '',
      onClick: () => @props.selectTab(@props.id)
    }, @renderTitle(), @renderExit())

  renderTitle: () ->
    React.createElement('span', {}, @props.id || @state.title || '')

  renderExit: () ->
    React.createElement('div', {
      onClick: (e) =>
        e.stopPropagation()
        @props.removeTab(@props.id)
    }, "\u00D7")
