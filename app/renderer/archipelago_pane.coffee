React = require('react')
ArchipelagoTerminal  = require('./archipelago_terminal')

module.exports =
class ArchipelagoPane extends React.Component
  render: ->
    React.createElement('archipelago-pane', {
      class: if @props.currentTab != @props.id then 'hidden' else '',
    }, @renderTerminals())

  renderTerminals: ->
    @props.terminals.map (terminalObject) =>
      React.createElement(
        ArchipelagoTerminal, {
          terminal: terminalObject,
          key: terminalObject.id,
          tabId: @props.id,
          currentTab: @props.currentTab,
          changeTitle: @props.changeTitle,
          markUnread: @props.markUnread,
          removeTerminal: @props.removeTerminal,
          selectTerminal: @props.selectTerminal
        }
      )
