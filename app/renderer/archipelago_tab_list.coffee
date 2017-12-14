React = require('react')
ArchipelagoTab  = require('./archipelago_tab')

module.exports =
class ArchipelagoTabList extends React.Component
  render: ->
    React.createElement(
      'archipelago-tab-list',
      null,
      @props.tabs.map (tabObject) =>
        React.createElement(
          ArchipelagoTab, {
            id: tabObject.id,
            title: tabObject.title,
            isUnread: tabObject.isUnread,
            selectTab: @props.selectTab,
            addTab: @props.addTab,
            removeTab: @props.removeTab,
            key: tabObject.id,
            active: @props.currentTab == tabObject.id
          }
        )
    )
