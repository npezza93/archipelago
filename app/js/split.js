'use strict'

class Split {
  constructor(orientation = 'horizontal') {
    this._orientation = orientation
  }

  split() {
    this._saveState()
    if (this._existingContainer()) {
      this.splitContainer = this.focusedTerminal.parentElement
      this._splitContainer.classList.remove('vertical')
      this._splitContainer.classList.remove('horizontal')
      this._splitContainer.classList.add(this._orientation)
      this.focusedTerminal.preserveState = null
    } else {
      this._wrapOriginalTerminalAndReopen()
    }

    this.splitContainer.appendChild(this.newTerminal)
    this.newTerminal.open()
    this.newTerminal._bindDataListeners()
    this.newTerminal.fit()
    setTimeout(() => { this.newTerminal.xterm.focus() }, 100)
    setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 200)
  }

  _saveState() {
    this._tab = this.focusedTerminal.tab
    this._xterm = this.focusedTerminal.xterm
    this._pty = this.focusedTerminal.pty
  }

  _wrapOriginalTerminalAndReopen() {
    this.splitContainer.appendChild(this.originalTerminal)
    this.focusedTerminal.replaceWith(this.splitContainer)
    setTimeout(() => { this.originalTerminal.open() }, 100)
    this.originalTerminal.bindExit()
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

  get splitContainer() {
    if (this._splitContainer) return this._splitContainer

    this._splitContainer = document.createElement('div')
    this._splitContainer.classList.add('terminal-container')
    this._splitContainer.classList.add(this._orientation)

    return this._splitContainer
  }

  set splitContainer(splitContainer) {
    this._splitContainer = splitContainer
  }
}

module.exports = Split
