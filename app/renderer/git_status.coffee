React    = require 'react'
{ exec } = require 'child_process'
tildify  = require 'tildify'
Octicon  = require('react-component-octicons').default

Branch   = require './addons/git-status/branch'
Dirty    = require './addons/git-status/dirty'
Behind   = require './addons/git-status/behind'
Ahead    = require './addons/git-status/ahead'

module.exports =
class GitStatus extends React.Component
  isGitCommand: 'git rev-parse --is-inside-work-tree'

  constructor: (props) ->
    super(props)

    @bindListeners()
    @state = cwd: null, isGit: false

  render: ->
    React.createElement(
      'archipelago-git-status'
      {}
      if @state.cwd then tildify(@state.cwd)
      React.createElement(
        'div'
        style:
          flex: 1
      )
      React.createElement(
        Branch, key: 'branch', isGit: @state.isGit, cwd: @state.cwd
      )
      React.createElement(
        Dirty, key: 'dirty', isGit: @state.isGit, cwd: @state.cwd
      )
      React.createElement(
        'div'
        className: 'behind-ahead-container'
        key: 'behindAheadContainer'
        React.createElement(
          Behind, key: 'behindElement', isGit: @state.isGit, cwd: @state.cwd
        )
        React.createElement(
          Ahead, key: 'ahead', isGit: @state.isGit, cwd: @state.cwd
        )
      )
    )

  cwd: ->
    unless @props.pid then return

    command = "lsof -p #{@props.pid} | awk '$4==\"cwd\"' | tr -s ' ' |
      cut -d ' ' -f9-"

    exec command, (err, stdout) =>
      @setState(cwd: stdout.trim())

  isGit: ->
    unless @state.cwd then return

    exec @isGitCommand, { cwd: @state.cwd }, (err) =>
      @setState(isGit: !err)

  bindListeners: ->
    archipelago.subscriptions.add archipelago.onDidChangeTitle @cwd.bind(this)
    archipelago.subscriptions.add archipelago.onDidChangeTitle @isGit.bind(this)
