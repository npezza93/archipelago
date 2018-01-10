React = require 'react'
Pane  = require './pane'

module.exports =
class PaneList extends React.Component
  render: ->
    React.createElement(
      'archipelago-pane-list'
      {}
      @props.tabs.map (tab) =>
        React.createElement(
          Pane
          id: tab.id
          key: tab.id
          sessions: tab.sessions
          currentTabId: @props.currentTabId
          currentSessionId: @props.currentSessionId
          changeTitle: @props.changeTitle
          markUnread: @props.markUnread
          removeSession: @props.removeSession
          selectSession: @props.selectSession
        )
    )
