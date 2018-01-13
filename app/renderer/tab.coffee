React = require 'react'

module.exports =
class Tab extends React.Component
  render: ->
    React.createElement(
      'archipelago-tab'
      class: @_class()
      onClick: (e) => @props.selectTab(e, @props.id)
      @_title()
      @_exit()
    )

  _title: () ->
    React.createElement('span', {}, @props.title || 'Loading...')

  _exit: () ->
    React.createElement(
      'div'
      onClick: (e) =>
        e.stopPropagation()
        @props.removeTab(@props.id)
      '\u00D7'
    )

  _class: () ->
    if @props.active
      'active'
    else if @props.isUnread
      'is-unread'
