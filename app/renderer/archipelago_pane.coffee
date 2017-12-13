React = require('react')
ArchipelagoTerminal  = require('./archipelago_terminal')

module.exports =
class ArchipelagoPane extends React.Component
  constructor: (props) ->
    super(props)
    @state = { terminals: [Math.random()] }

  render: ->
    React.createElement('archipelago-pane', {
      class: if !@props.active then 'hidden' else '',
    }, @renderTerminals())

  renderTerminals: ->
    @state.terminals.map (terminalId) =>
      React.createElement(
        ArchipelagoTerminal, {
          id: terminalId,
          key: terminalId,
          tabId: @props.id,
          changeTitle: @props.changeTitle
        }
      )
