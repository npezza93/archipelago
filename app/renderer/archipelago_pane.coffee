React = require('react')
ArchipelagoTerminal  = require('./archipelago_terminal')

module.exports =
class ArchipelagoPane extends React.Component
  constructor: (props) ->
    super(props)
    @state = { terminals: [{ id: Math.random() }] }

  render: ->
    React.createElement('archipelago-pane', {
      class: if @props.currentTab != @props.id then 'hidden' else '',
    }, @renderTerminals())

  renderTerminals: ->
    @state.terminals.map (terminalObject) =>
      React.createElement(
        ArchipelagoTerminal, {
          id: terminalObject.id,
          key: terminalObject.id,
          tabId: @props.id,
          currentTab: @props.currentTab,
          changeTitle: @props.changeTitle,
          markUnread: @props.markUnread,
          removeTerminal: @removeTerminal.bind(this)
        }
      )

  removeTerminal: (terminalId) ->
    terminals = @state.terminals.filter (terminalObject) =>
      terminalId != terminalObject.id

    if terminals.length == 0
      @props.removeTab(@props.id)
    else
      @setState(terminals: terminals)
