require('../utils/attr')

Pty          = require('node-pty')
defaultShell = require('default-shell')
ConfigFile   = require('../js/config_file')

class ArchipelagoTerminal extends HTMLElement
  @attr 'pty',
    get: ->
      return @_pty if @_pty?
      args = undefined

      args = @settings('shellArgs').split(",") if @settings('shellArgs')

      @_pty = Pty.spawn(@settings('shell') ||defaultShell, args, {
        name: 'xterm-256color',
        env: process.env
      })

      @_pty
    set: (pty) ->
      @_pty = pty

  @attr 'xterm',
    get: ->
      return @_xterm if @_xterm?

      @_xterm = new Terminal({
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

  @attr 'tab',
    get: ->
      @_tab
    set: (tab) ->
      @_tab = tab

  @attr 'preserveState',
    get: ->
      @_preserveState
    set: (preserveState) ->
      @_preserveState = preserveState

  @attr 'configFile',
    get: ->
      return @_configFile if @_configFile?

      @_configFile = new ConfigFile()

  disconnectedCallback: ->
    return if @preserveState

    @xterm.destroy()
    @pty.kill()
    @tab.remove() if @tab.terminals().length == 0

  open: ->
    return unless @pty? && @xterm?

    @xterm.open(this, true)
    @xterm.setOption('bellStyle', @settings('bellStyle'))

  fit: ->
    @xterm.charMeasure.measure(@xterm.options)
    rows = Math.floor(@xterm.element.offsetHeight / @xterm.charMeasure.height)
    cols = Math.floor(@xterm.element.offsetWidth / @xterm.charMeasure.width)

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
      'letterSpacing',
      'cursorStyle',
      'cursorBlink',
      'bellSound',
      'bellStyle',
      'scrollback',
      'theme'
    ].forEach (field) =>
      if @xterm[field] != @settings(field)
        @xterm.setOption(field, @settings(field))

    ['tabStopWidth', 'fontSize'].forEach (field) =>
      if @xterm[field] != parseInt(@settings(field))
        @xterm.setOption(field, parseInt(@settings(field)))

    ['lineHeight'].forEach (field) =>
      if @xterm[field] != parseFloat(@settings(field))
        @xterm.setOption(field, parseFloat(@settings(field)))

    @fit()

  bindExit: ->
    @pty.on 'exit', () =>
      @remove()
      if document.querySelector('archipelago-tab') == null
        window.close()
      else
        document.querySelector('archipelago-tab').focus()

      # unsplit

  bindDataListeners: ->
    @configFile.on('change', @updateSettings)

    @xterm.on 'data', (data) =>
      @pty.write(data)

    @xterm.on 'focus', () =>
      @fit()
      @tab.title = @xterm.title

    @xterm.on 'title', (title) =>
      @tab.title = title

    @pty.on 'data', (data) =>
      @xterm.write(data)
      if !@tab.isActive() && !@tab.classList.contains('is-unread')
        @tab.classList += ' is-unread'

    @bindExit()

module.exports = ArchipelagoTerminal
window.customElements.define('archipelago-terminal', ArchipelagoTerminal)
