React    = require 'react'
{ exec } = require 'child_process'
Octicon  = require('react-component-octicons').default

module.exports =
class Branch extends React.Component
  command: "git symbolic-ref --short HEAD || git rev-parse --short HEAD"

  constructor: (props) ->
    super(props)

    @state = branch: null
    @bindListeners()

  render: ->
    React.createElement(
      'archipelago-git-status-branch'
      {}
      if @state.branch
        [
          React.createElement(Octicon, key: 'icon', name: 'git-branch')
          React.createElement('div', key: 'branch', @state.branch)
        ]
    )

  branch: ->
    return unless @props.isGit

    exec @command, { cwd: @props.cwd }, (err, stdout) =>
      if err
        @setState(branch: null)
      else
        @setState(branch: stdout.trim())

  bindListeners: ->
    archipelago.subscriptions.add(
      archipelago.onDidChangeTitle @branch.bind(this)
    )
