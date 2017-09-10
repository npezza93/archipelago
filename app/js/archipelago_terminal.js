'use strict'

const Pty = require('node-pty')
const defaultShell = require('default-shell')

class ArchipelagoTerminal extends HTMLElement {
  disconnectedCallback() {
    if (this.preserveState) return

    this.xterm.destroy()
    this.pty.kill()
    if (this.tab.terminals.length === 0) {
      this.tab.remove()
    }
  }

  open() {
    if (this.pty && this.xterm) {
      this.xterm.open(this, true)
      this.xterm.setOption('bellStyle', 'both')
    }
  }

  fit () {
    this.xterm.charMeasure.measure(this.xterm.options)
    var rows = Math.floor(this.xterm.element.offsetHeight / this.xterm.charMeasure.height)
    var cols = Math.floor(this.xterm.element.offsetWidth / this.xterm.charMeasure.width)

    this.xterm.resize(cols, rows)
    this.pty.resize(cols, rows)
  }

  get pty() {
    if (this._pty) return this._pty

    this._pty = Pty.spawn(defaultShell, [], {
      name: 'xterm-256color',
      cwd: process.env.PWD,
      env: process.env
    })
    return this._pty
  }

  set pty(pty) {
    this._pty = pty
  }

  get xterm() {
    if (this._xterm) return this._xterm

    this._xterm = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block', // block | underline | bar
      bellStyle: 'visual',
      bellSound: 'https://raw.githubusercontent.com/chromium/hterm/master/audio/bell.ogg',
      fontSize: 15,
      fontFamily: 'firaCode-retina',
      scrollback: 4000,
      theme: {
        foreground: '#ffffff',
        background: 'transparent',
        cursor: '#ffffff',
        selection: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#e06c75',
        brightRed: '#e06c75',
        green: '#A4EFA1',
        brightGreen: '#A4EFA1',
        brightYellow: '#EDDC96',
        yellow: '#EDDC96',
        magenta: '#e39ef7',
        brightMagenta: '#e39ef7',
        cyan: '#5fcbd8',
        brightBlue: '#5fcbd8',
        brightCyan: '#5fcbd8',
        blue: '#5fcbd8',
        white: '#d0d0d0',
        brightBlack: '#808080',
        brightWhite: '#ffffff'
      }
    })
    return this._xterm
  }

  set xterm(xterm) {
    this._xterm = xterm
  }

  get tab() {
    return this._tab
  }

  set tab(tab) {
    this._tab = tab
  }

  get preserveState() {
    return this._preserve_state
  }

  set preserveState(preserveState) {
    this._preserve_state = preserveState
  }

  bindExit() {
    this.pty.on('exit', () => {
      this.remove()
      if (document.querySelector('archipelago-tab') == null) {
        window.close()
      } else {
        document.querySelector('archipelago-tab').focus()
      }
    })
  }

  _bindDataListeners () {
    this.xterm.on('data', (data) => {
      this.pty.write(data)
    })
    this.xterm.on('focus', () => {
      this.fit()
      this.tab.title = this.xterm.title
    })
    this.xterm.on('title', (title) => {
      this.tab.title = title
    })

    this.pty.on('data', (data) => {
      this.xterm.write(data)
    })
    this.bindExit()
  }
};

module.exports = ArchipelagoTerminal
window.customElements.define('archipelago-terminal', ArchipelagoTerminal)
