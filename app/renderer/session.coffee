Pty                  = require('node-pty')
defaultShell         = require('default-shell')
ConfigFile           = require('../utils/config_file')
{ EventEmitter }     = require('events')
React                = require('react')
ArchipelagoTerminal  = require('./archipelago_terminal')

module.exports =
class Session
  constructor: (group) ->
    @id = Math.random()
    @group = group
    @emitter = new EventEmitter()
    @configFile = new ConfigFile()
    @pty = Pty.spawn(
      @settings('shell') || defaultShell,
      @settings('shellArgs').split(','),
      { name: 'xterm-256color', cwd: process.PWD, env: process.env }
    )
    @xterm = new Terminal({
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
    @bindDataListeners()

  render: (props) ->
    React.createElement(
      ArchipelagoTerminal, {
        terminal: this,
        key: @id,
        tabId: props.id,
        currentTab: props.currentTab,
        changeTitle: props.changeTitle,
        markUnread: props.markUnread,
        removeTerminal: props.removeTerminal,
        selectTerminal: props.selectTerminal
      }
    )

  isSession: ->
    true

  on: (event, handler) ->
    @emitter.on(event, handler)

  setBellStyle: ->
    @xterm.setOption('bellStyle', @settings('bellStyle'))

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

  bindDataListeners: ->
    @configFile.on 'change', () =>
      @updateSettings()

    @xterm.on 'data', (data) =>
      @pty.write(data)

    @xterm.on 'focus', () =>
      @fit()
      @emitter.emit('focused')

    @xterm.on 'title', (title) =>
      @emitter.emit('titleChanged')

    @pty.on 'data', (data) =>
      @xterm.write(data)
      @emitter.emit('data')

    @pty.on 'exit', () =>
      @pty.kill()
      @emitter.emit('exit')

    window.addEventListener 'resize', () =>
      @fit()
