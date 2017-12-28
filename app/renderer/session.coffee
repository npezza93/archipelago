Pty                 = require('node-pty')
defaultShell        = require('default-shell')
React               = require('react')
{ EventEmitter }    = require('events')
{ isHotkey }        = require('is-hotkey')
ConfigFile          = require('../utils/config_file')
ArchipelagoTerminal = require('./archipelago_terminal')

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
      bellStyle: @settings('bellStyle'),
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

  kill: ->
    window.removeEventListener('resize', @fit.bind(this))

    @pty.kill()
    @xterm.destroy()

  on: (event, handler) ->
    @emitter.on(event, handler)

  fit: ->
    @xterm.charMeasure.measure(@xterm.options)
    rows = Math.floor(@xterm.element.offsetHeight / @xterm.charMeasure.height)
    cols = Math.floor(@xterm.element.offsetWidth / @xterm.charMeasure.width) - 2

    try
      @xterm.resize(cols, rows)
      @pty.resize(cols, rows)

  settings: (setting) ->
    if setting?
      @configFile.activeSettings()[setting]
    else
      @configFile.activeSettings()

  hotkeyHandler: (e) =>
    caught = false

    Object.values(@settings('keyboard')[process.platform]).forEach (hotkey) =>
      if isHotkey(hotkey.accelerator, e)
        command = hotkey.command.map (num) =>
          String.fromCharCode(parseInt(num))
        @pty.write(command.join(''))
        caught = true

    !caught

  updateSettings: ->
    ['fontFamily', 'lineHeight', 'cursorStyle', 'cursorBlink', 'bellSound',
     'bellStyle', 'scrollback', 'theme'].forEach (field) =>
       if @xterm[field] != @settings(field)
         @xterm.setOption(field, @settings(field))

    ['tabStopWidth', 'fontSize', 'letterSpacing'].forEach (field) =>
      if @xterm[field] != parseInt(@settings(field))
        @xterm.setOption(field, parseInt(@settings(field)))

    ['lineHeight'].forEach (field) =>
      if @xterm[field] != parseFloat(@settings(field))
        @xterm.setOption(field, parseFloat(@settings(field)))

    @bindCopyOnSelect()
    @fit()

  bindCopyOnSelect: ->
    @xterm.selectionManager.on 'selection', () =>
      if @settings('copyOnSelect')
        document.execCommand('copy')

  bindDataListeners: ->
    @xterm.attachCustomKeyEventHandler(@hotkeyHandler)
    window.addEventListener 'resize', @fit.bind(this)
    @configFile.on 'change', @updateSettings.bind(this)

    @xterm.on 'data', (data) =>
      try
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
      @emitter.emit('exit')
