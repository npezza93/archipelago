React = require('react')
ArchipelagoPane  = require('./archipelago_pane')

module.exports =
class ArchipelagoPaneList extends React.Component
  render: ->
    React.createElement(
      'archipelago-pane-list',
      null,
      @props.ids.map (tabId) =>
        React.createElement(
          ArchipelagoPane, {
            id: tabId,
            key: tabId,
            active: @props.currentTab == tabId
          }
        )
    )
