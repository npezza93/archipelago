React    = require 'react'
{ exec } = require 'child_process'
Octicon  = require('react-component-octicons').default

module.exports =
class Behind extends React.Component
  command: "git rev-list --left-only --count HEAD...@'{u}'"

  constructor: (props) ->
    super(props)

    @state = ahead: 0
    @bindListeners()

  render: ->
    React.createElement(
      'archipelago-git-status-ahead'
      {}
      if @state.ahead > 0
        [
          React.createElement(Octicon, name: 'arrow-up'),
          React.createElement('div', null, @state.ahead)
        ]
    )

  ahead: ->
    return unless @props.isGit

    exec @command, { cwd: @props.cwd }, (err, stdout) =>
      if err
        @setState(ahead: 0)
      else
        @setState(ahead: stdout.trim())

  bindListeners: ->
    archipelago.subscriptions.add(
      archipelago.onDidChangeTitle @ahead.bind(this)
    )
