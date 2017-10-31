require('../utils/attr')

module.exports =
class Split
  @attr 'separator',
    get: ->
      return @_separator if @_separator

      @_separator = document.createElement('div')
      @_separator.classList.add('separator')

      @_separator.addEventListener 'mousedown', (ev) =>
        console.log(ev)

      @_separator

  @attr 'splitContainer',
    get: ->
      return @_splitContainer if @_splitContainer

      @_splitContainer = document.createElement('div')
      @_splitContainer.classList.add('terminal-container')
      @_splitContainer.classList.add(@_orientation)

      @_splitContainer

    set: (splitContainer) ->
      @_splitContainer = splitContainer

  constructor: (@orientation) ->

  split: ->
    @saveState()
    if @existingContainer()
      this.splitContainer = this.focusedTerminal.parentElement
      this._splitContainer.classList.remove('vertical')
      this._splitContainer.classList.remove('horizontal')
      this._splitContainer.classList.add(this._orientation)
      this.focusedTerminal.preserveState = null
    } else {
      this._wrapOriginalTerminalAndReopen()
    }

    this.splitContainer.appendChild(this.separator)
    this.splitContainer.appendChild(this.newTerminal)
    this.newTerminal.open()
    this.newTerminal._bindDataListeners()
    this.newTerminal.fit()
    this.newTerminal.xterm.focus()
    window.dispatchEvent(new Event('resize'))
  }

  _saveState() {
    this._tab = this.focusedTerminal.tab
    this._xterm = this.focusedTerminal.xterm
    this._pty = this.focusedTerminal.pty
  }

  _wrapOriginalTerminalAndReopen() {
    this.splitContainer.appendChild(this.originalTerminal)
    this.focusedTerminal.replaceWith(this.splitContainer)
    this.originalTerminal.open()
    this.originalTerminal.bindExit()
    this.originalTerminal.xterm.setOption('theme', this.originalTerminal.settings.theme)
  }

  _existingContainer() {
    let parent = this.focusedTerminal.parentElement

    return parent.childElementCount === 1 && parent.classList.contains('terminal-container')
  }

  get originalTerminal() {
    if (this._originalTerminal) return this._originalTerminal

    this._originalTerminal = document.createElement('archipelago-terminal')
    this._originalTerminal.tab = this._tab
    this._originalTerminal.xterm = this._xterm
    this._originalTerminal.pty = this._pty

    return this._originalTerminal
  }

  get newTerminal() {
    if (this._newTerminal) return this._newTerminal

    this._newTerminal = document.createElement('archipelago-terminal')
    this._newTerminal.tab = this._tab

    return this._newTerminal
  }

  get focusedTerminal() {
    if (this._focusedTerminal) return this._focusedTerminal

    let focusedTerminal = document.activeElement
    let body = document.querySelector('body')

    while (focusedTerminal !== body && focusedTerminal.tagName !== 'ARCHIPELAGO-TERMINAL') {
      focusedTerminal = focusedTerminal.parentElement
    }

    if (focusedTerminal === body) {
      let terminals = document.querySelector('archipelago-tab.active').terminals

      this._focusedTerminal = terminals[terminals.length - 1]
    } else {
      this._focusedTerminal = focusedTerminal
    }

    this._focusedTerminal.preserveState = true
    return this._focusedTerminal
  }
