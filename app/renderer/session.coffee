{ spawn }           = require 'node-pty'
defaultShell        = require 'default-shell'
React               = require 'react'
{ EventEmitter }    = require 'events'
Terminal            = require './terminal'
Xterm               = require('xterm').Terminal

Xterm.applyAddon(require('xterm/lib/addons/fit/fit'))

module.exports =
class Session
  isSession: true

  constructor: (group) ->
    @id = Math.random()
    @group = group
    @emitter = new EventEmitter
    @pty = spawn(
      @settings('shell') || defaultShell
      @settings('shellArgs').split(',')
      name: 'xterm-256color', cwd: process.env.HOME, env: process.env
    )
    @xterm = new Xterm(
      fontFamily: @settings('fontFamily')
      fontSize: @settings('fontSize')
      lineHeight: @settings('lineHeight')
      letterSpacing: @settings('letterSpacing')
      cursorStyle: @settings('cursorStyle')
      cursorBlink: @settings('cursorBlink')
      bellSound: @settings('bellSound')
      bellStyle: @settings('bellStyle')
      scrollback: @settings('scrollback')
      tabStopWidth: @settings('tabStopWidth')
      theme: @settings('theme')
    )
    @bindDataListeners()

  render: (props) ->
    React.createElement(
      Terminal
      key: @id
      session: this
      tabId: props.id
      currentTabId: props.currentTabId
      changeTitle: props.changeTitle
      markUnread: props.markUnread
      removeSession: props.removeSession
      selectSession: props.selectSession
    )

  kill: ->
    window.removeEventListener('resize', @fit.bind(this))

    @pty.kill()
    @xterm.destroy()

  on: (event, handler) ->
    @emitter.on(event, handler)

  fit: ->
    @xterm.charMeasure.measure(@xterm.options)

    @xterm.fit()
    @pty.resize(@xterm.cols, @xterm.rows)

  settings: (setting) ->
    archipelago.config.get(setting)

  keybindingHandler: (e) ->
    caught = false

    archipelago.keymaps.mappings.forEach (mapping) =>
      if archipelago.keymaps.keystrokeForKeyboardEvent(e) == mapping.keystroke
        @pty.write(keybinding.command)
        caught = true

    !caught

  bindScrollListener: ->
    @xterm.element.addEventListener 'wheel', () =>
      clearTimeout(@scrollbarFade)
      @scrollbarFade = setTimeout(
        () => @xterm.element.classList.remove('scrolling'),
        600
      )
      @xterm.element.classList.add('scrolling')

  bindDataListeners: ->
    @xterm.attachCustomKeyEventHandler(@keybindingHandler)
    window.addEventListener 'resize', @fit.bind(this)

    @xterm.on 'data', (data) =>
      try
        @pty.write(data)

    @xterm.on 'focus', () =>
      @fit()
      setTimeout(() =>
        @xterm.setOption('cursorBlink', !@settings('cursorBlink'))
        @xterm.setOption('cursorBlink', @settings('cursorBlink'))
        100
      )
      @emitter.emit('did-focus')

    @xterm.on 'title', (title) =>
      @emitter.emit('did-change-title')

    @xterm.on 'selection', () =>
      document.execCommand('copy') if @settings('copyOnSelect')

    @pty.on 'data', (data) =>
      @xterm.write(data)
      @emitter.emit('data')

    @pty.on 'exit', () =>
      @emitter.emit('did-exit')

    ['fontFamily', 'cursorStyle', 'cursorBlink', 'scrollback',
     'enableBold', 'tabStopWidth', 'fontSize', 'letterSpacing',
     'lineHeight', 'bellSound', 'bellStyle', 'theme'].forEach (field) =>
       archipelago.config.onDidChange field, (newValue) =>
         @xterm.setOption(field, newValue)
