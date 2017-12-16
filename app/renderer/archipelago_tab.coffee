React = require('react')

module.exports =
class ArchipelagoTab extends React.Component
  render: ->
    React.createElement('archipelago-tab', {
      class: @htmlClasses(),
      onClick: () => @props.selectTab(@props.id)
    }, @renderTitle(), @renderExit())

  renderTitle: () ->
    React.createElement('span', {}, @props.title || 'Loading...')

  renderExit: () ->
    React.createElement('div', {
      onClick: (e) =>
        e.stopPropagation()
        @props.removeTab(@props.id)
    }, "\u00D7")

  htmlClasses: () ->
    classes = []
    if @props.active
      classes.push('active')
    else if @props.isUnread
      classes.push('is-unread')

    classes.join(' ')
