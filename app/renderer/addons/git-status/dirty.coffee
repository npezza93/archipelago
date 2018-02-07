React    = require 'react'
{ exec } = require 'child_process'
Octicon  = require('react-component-octicons').default

module.exports =
class Dirty extends React.Component
  command: "git status --porcelain --ignore-submodules -uno"

  constructor: (props) ->
    super(props)

    @state = isDirty: false
    @bindListeners()

  render: ->
    React.createElement(
      'archipelago-git-status-dirty'
      {}
      if @state.isDirty
        React.createElement(Octicon, name: 'diff-modified', className: 'dirty')
    )

  isDirty: ->
    return unless @props.isGit

    exec @command, { cwd: @props.cwd }, (err, stdout) =>
      if err
        @setState(isDirty: false)
      else
        @setState(isDirty: stdout)

  bindListeners: ->
    archipelago.subscriptions.add(
      archipelago.onDidChangeTitle @isDirty.bind(this)
    )
