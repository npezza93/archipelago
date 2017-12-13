React = require('react')
ArchipelagoTab  = require('./archipelago_tab')

module.exports =
class ArchipelagoTabList extends React.Component
  render: ->
    React.createElement(
      'archipelago-tab-list',
      null,
      @props.ids.map (tabId) =>
        React.createElement(
          ArchipelagoTab, {
            id: tabId,
            selectTab: @props.selectTab,
            addTab: @props.addTab,
            removeTab: @props.removeTab,
            key: tabId,
            active: @props.currentTab == tabId
          }
        )
    )
