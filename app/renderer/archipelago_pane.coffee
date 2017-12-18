React = require('react')
ArchipelagoTerminal  = require('./archipelago_terminal')

module.exports =
class ArchipelagoPane extends React.Component
  render: ->
    React.createElement('archipelago-pane', {
      class: if @props.currentTab != @props.id then 'hidden' else '',
    }, @props.terminals.render(@props))
