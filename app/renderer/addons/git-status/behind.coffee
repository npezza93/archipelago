React    = require 'react'
{ exec } = require 'child_process'
Octicon  = require('react-component-octicons').default

module.exports =
class Behind extends React.Component
  command: "git rev-list --right-only --count HEAD...@'{u}'"

  constructor: (props) ->
    super(props)

    @state = behind: 0
    @bindListeners()

  render: ->
    React.createElement(
      'archipelago-git-status-behind'
      key: 'behind'
      if @state.behind > 0
        [
          React.createElement(Octicon, key: 'icon', name: 'arrow-down'),
          React.createElement('div', key: 'behindText', @state.behind)
        ]
    )

  behind: ->
    return unless @props.isGit

    exec @command, { cwd: @props.cwd }, (err, stdout) =>
      if err
        @setState(behind: 0)
      else
        @setState(behind: stdout.trim())

  bindListeners: ->
    archipelago.subscriptions.add(
      archipelago.onDidChangeTitle @behind.bind(this)
    )
