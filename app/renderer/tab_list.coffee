React = require 'react'
Tab   = require './tab'

module.exports =
class TabList extends React.Component
  render: ->
    React.createElement(
      'archipelago-tab-list'
      {}
      @props.tabs.map (tab) =>
        React.createElement(
          Tab
          id: tab.id
          key: tab.id
          title: tab.title
          isUnread: tab.isUnread
          active: @props.currentTabId == tab.id
          selectTab: @props.selectTab
          addTab: @props.addTab
          removeTab: @props.removeTab
        )
    )
