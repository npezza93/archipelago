require('../utils/attr')

React = require('react')

Pty          = require('node-pty')
defaultShell = require('default-shell')
ConfigFile   = require('../utils/config_file')
Unsplit      = require('./unsplit')

module.exports =
class ArchipelagoTerminal extends React.Component
  @attr 'pty',
    get: ->
      @_pty ?= Pty.spawn(@settings('shell') ||defaultShell, @settings('shellArgs').split(','), {
        name: 'xterm-256color',
        env: process.env
      })
    set: (pty) ->
      @_pty = pty

  @attr 'xterm',
    get: ->
      @_xterm ?= new Terminal({
        fontFamily: @settings('fontFamily'),
        fontSize: @settings('fontSize'),
        lineHeight: @settings('lineHeight'),
        letterSpacing: @settings('letterSpacing'),
        cursorStyle: @settings('cursorStyle'),
        cursorBlink: @settings('cursorBlink'),
        bellSound: @settings('bellSound'),
        scrollback: @settings('scrollback'),
        tabStopWidth: parseInt(@settings('tabStopWidth')),
        theme: @settings('theme')
      })
    set: (xterm) ->
      @_xterm = xterm

  @attr 'configFile',
    get: ->
      @_configFile ?= new ConfigFile()

  constructor: (props) ->
    super(props)
    @bindDataListeners()
    @resizeEnd = null

  render: ->
    React.createElement('archipelago-terminal', { ref: "container" })

  componentDidMount: ->
    return unless @pty? && @xterm?

    @xterm.open(@refs.container, true)
    @xterm.setOption('bellStyle', @settings('bellStyle'))
    @xterm.focus()

  componentWillUnmount: ->
    @kill()

  fit: ->
    @xterm.charMeasure.measure(@xterm.options)
    rows = Math.floor(@xterm.element.offsetHeight / @xterm.charMeasure.height)
    cols = Math.floor(@xterm.element.offsetWidth / @xterm.charMeasure.width) - 2

    @xterm.resize(cols, rows)
    @pty.resize(cols, rows)

  settings: (setting) ->
    if setting?
      @configFile.activeSettings()[setting]
    else
      @configFile.activeSettings()

  updateSettings: ->
    [
      'fontFamily',
      'lineHeight',
      'cursorStyle',
      'cursorBlink',
      'bellSound',
      'bellStyle',
      'scrollback',
      'theme'
    ].forEach (field) =>
      if @xterm[field] != @settings(field)
        @xterm.setOption(field, @settings(field))

    ['tabStopWidth', 'fontSize', 'letterSpacing'].forEach (field) =>
      if @xterm[field] != parseInt(@settings(field))
        @xterm.setOption(field, parseInt(@settings(field)))

    ['lineHeight'].forEach (field) =>
      if @xterm[field] != parseFloat(@settings(field))
        @xterm.setOption(field, parseFloat(@settings(field)))

    @fit()

  kill: ->
    await @xterm.destroy()
    await @pty.kill()

  bindDataListeners: ->
    @configFile.on 'change', () =>
      @updateSettings()

    @xterm.on 'data', (data) =>
      @pty.write(data)

    @xterm.on 'focus', () =>
      @fit()
      @props.changeTitle(@props.tabId, @xterm.title)

    @xterm.on 'title', (title) =>
      @props.changeTitle(@props.tabId, @xterm.title)

    @pty.on 'data', (data) =>
      @xterm.write(data)
      if @props.currentTab != @props.tabId
        @props.markUnread(@props.tabId)

    @pty.on 'exit', () =>
      @kill()

      @props.removeTerminal(@props.id)

    window.addEventListener 'resize', () =>
      @fit()
