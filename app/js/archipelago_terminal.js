'use strict'

const Pty = require('node-pty')
const defaultShell = require('default-shell')
const { join } = require('path')

const ConfigFile = require(join(__dirname, '/config_file'))

class ArchipelagoTerminal extends HTMLElement {
  disconnectedCallback() {
    if (this.preserveState) return

    this.xterm.destroy()
    this.pty.kill()
    if (this.tab.terminals.length === 0) this.tab.remove()
  }

  open() {
    if (this.pty && this.xterm) {
      this.xterm.open(this, true)
      this.xterm.setOption('bellStyle', this.settings.bellStyle)
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
    let args

    if (this.configFile.shellArgs) {
      args = this.configFile.shellArgs.split(",")
    } else {
      args = ['--login']
    }
    this._pty = Pty.spawn(this.configFile.shell ||defaultShell, args, {
      name: 'xterm-256color',
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
      cursorBlink: this.settings.cursorBlink,
      cursorStyle: this.settings.cursorStyle,
      bellSound: this.settings.bellSound,
      fontSize: this.settings.fontSize,
      fontFamily: this.settings.fontFamily,
      scrollback: this.settings.scrollback,
      theme: this.settings.theme
      // // foreground: '#ffffff',
      // // background: 'none',
      // // cursor: '#ffffff',
      // // selection: 'rgba(255, 255, 255, 0.3)',
      // // black: '#000000',
      // // red: '#e06c75',
      // // brightRed: '#e06c75',
      // // green: '#A4EFA1',
      // // brightGreen: '#A4EFA1',
      // // brightYellow: '#EDDC96',
      // // yellow: '#EDDC96',
      // // magenta: '#e39ef7',
      // // brightMagenta: '#e39ef7',
      // // cyan: '#5fcbd8',
      // // brightBlue: '#5fcbd8',
      // // brightCyan: '#5fcbd8',
      // // blue: '#5fcbd8',
      // // white: '#d0d0d0',
      // // brightBlack: '#808080',
      // // brightWhite: '#ffffff'
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

  get settings() {
    return this.configFile.contents
  }

  get configFile() {
    if (this._configFile) return this._configFile

    this._configFile = new ConfigFile()

    return this._configFile
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
    this._configFile.on('change', () => {
      let element = document.documentElement

      element.style.setProperty('--font-family', this.settings.fontFamily)

      let fields = ['cursorStyle', 'cursorBlink', 'fontFamily', 'fontSize', 'scrollback', 'bellStyle', 'theme']

      fields.forEach((field) => {
        if (this.xterm[field] !== this.settings[field]) {
          this.xterm.setOption(field, this.settings[field])
          this.fit()
        }
      })
    })

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
