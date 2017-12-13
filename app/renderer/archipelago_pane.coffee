React = require('react')
ArchipelagoTerminal  = require('./archipelago_terminal')

module.exports =
class ArchipelagoPane extends React.Component
  constructor: (props) ->
    super(props)
    @state = { terminals: [] }

  render: ->
    React.createElement('archipelago-pane', {
      class: if !@props.active then 'hidden' else '',
    }, @state.terminals)

  renderTerminals: ->
    @properties.terminals.map (terminal) ->
      terminal.render()

  newTerminal: ->
    new ArchipelagoTerminal({paneComponent: this})
