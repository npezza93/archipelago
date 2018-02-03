{ spawn }                        = require 'node-pty'
defaultShell                     = require 'default-shell'
React                            = require 'react'
{ Emitter, CompositeDisposable } = require 'event-kit'
Terminal                         = require './terminal'
Xterm                            = require('xterm').Terminal

Xterm.applyAddon(require('xterm/lib/addons/fit/fit'))

module.exports =
class Session
  isSession: true

  constructor: (group) ->
    @id = Math.random()
    @group = group
    @emitter = new Emitter
    @subscriptions = new CompositeDisposable
    @pty = spawn(
      @setting('shell') || defaultShell
      @setting('shellArgs').split(',')
      name: 'xterm-256color'
      cwd: process.env.HOME
      env: process.env
    )

    @xterm = new Xterm(
      fontFamily: @setting('fontFamily')
      fontSize: @setting('fontSize')
      lineHeight: @setting('lineHeight')
      letterSpacing: @setting('letterSpacing')
      cursorStyle: @setting('cursorStyle')
      cursorBlink: @setting('cursorBlink')
      bellSound: @setting('bellSound')
      bellStyle: @setting('bellStyle')
      scrollback: @setting('scrollback')
      tabStopWidth: @setting('tabStopWidth')
      theme: @setting('theme')
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

    @emitter.dispose()
    @subscriptions.dispose()
    @pty.kill()
    @xterm.destroy()

  on: (event, handler) ->
    @emitter.on(event, handler)

  fit: ->
    @xterm.charMeasure.measure(@xterm.options)

    @xterm.fit()
    @pty.resize(@xterm.cols, @xterm.rows)

  setting: (setting) ->
    archipelago.config.get(setting)

  keybindingHandler: (e) ->
    caught = false

    archipelago.keymaps.mappings.forEach (mapping) =>
      if archipelago.keymaps.keystrokeForKeyboardEvent(e) == mapping.keystroke
        @pty.write(mapping.command)
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

  onDidFocus: (callback) ->
    @emitter.on 'did-focus', callback

  onDidChangeTitle: (callback) ->
    @emitter.on 'did-change-title', callback

  onDidExit: (callback) ->
    @emitter.on 'did-exit', callback

  onData: (callback) ->
    @emitter.on 'data', callback

  bindDataListeners: ->
    @xterm.attachCustomKeyEventHandler(@keybindingHandler.bind(this))
    window.addEventListener 'resize', @fit.bind(this)

    @xterm.on 'data', (data) =>
      try
        @pty.write(data)

    @xterm.on 'focus', () =>
      @fit()
      window.requestAnimationFrame(() =>
        @xterm.setOption('cursorBlink', !@setting('cursorBlink'))
        @xterm.setOption('cursorBlink', @setting('cursorBlink'))
      )
      @emitter.emit('did-focus')

    @xterm.on 'title', (title) =>
      @emitter.emit('did-change-title')

    @xterm.on 'selection', () =>
      document.execCommand('copy') if @setting('copyOnSelect')

    @pty.on 'data', (data) =>
      @xterm.write(data)
      @emitter.emit('data')

    @pty.on 'exit', () =>
      @emitter.emit('did-exit')

    ['fontFamily', 'cursorStyle', 'cursorBlink', 'scrollback',
     'enableBold', 'tabStopWidth', 'fontSize', 'letterSpacing',
     'lineHeight', 'bellSound', 'bellStyle', 'theme'].forEach (field) =>
       @subscriptions.add archipelago.config.onDidChange field, (newValue) =>
         @xterm.setOption(field, newValue)
