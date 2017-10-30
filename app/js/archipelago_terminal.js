const Pty = require('node-pty')
const defaultShell = require('default-shell')
const { join } = require('path')

const ConfigFile = require('./config_file')

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

    if (this.settings.shellArgs) {
      args = this.settings.shellArgs.split(",")
    }
    this._pty = Pty.spawn(this.settings.shell ||defaultShell, args, {
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
      fontFamily: this.settings.fontFamily,
      fontSize: this.settings.fontSize,
      lineHeight: this.settings.lineHeight,
      letterSpacing: this.settings.letterSpacing,
      cursorStyle: this.settings.cursorStyle,
      cursorBlink: this.settings.cursorBlink,
      bellSound: this.settings.bellSound,
      scrollback: this.settings.scrollback,
      tabStopWidth: parseInt(this.settings.tabStopWidth),
      theme: this.settings.theme
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
    return this.configFile.activeSettings()
  }

  get configFile() {
    if (this._configFile) return this._configFile

    this._configFile = new ConfigFile()

    return this._configFile
  }

  updateSettings() {
    let strings = [
      'fontFamily',
      'lineHeight',
      'letterSpacing',
      'cursorStyle',
      'cursorBlink',
      'bellSound',
      'bellStyle',
      'scrollback',
      'theme'
    ]

    let integers = ['tabStopWidth', 'fontSize']
    let floats = ['lineHeight']

    strings.forEach((field) => {
      if (this.xterm[field] !== this.settings[field]) {
        this.xterm.setOption(field, this.settings[field])
        this.fit()
      }
    })

    integers.forEach((field) => {
      if (this.xterm[field] !== parseInt(this.settings[field])) {
        this.xterm.setOption(field, parseInt(this.settings[field]))
        this.fit()
      }
    })

    floats.forEach((field) => {
      if (this.xterm[field] !== parseFloat(this.settings[field])) {
        this.xterm.setOption(field, parseFloat(this.settings[field]))
        this.fit()
      }
    })
  }

  bindExit() {
    this.pty.on('exit', () => {
      this.remove()
      if (document.querySelector('archipelago-tab') == null) {
        window.close()
      } else {
        document.querySelector('archipelago-tab').focus()
      }

      if (this.parentElement.classList.contains('terminal-container')) {

      }
    })
  }

  _bindDataListeners () {
    this._configFile.on('change', () => {
      this.updateSettings()
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
      if (!this.tab.isActive() && !this.tab.classList.contains('is-unread')) {
        this.tab.classList += ' is-unread'
      }
    })
    this.bindExit()
  }
};

module.exports = ArchipelagoTerminal
window.customElements.define('archipelago-terminal', ArchipelagoTerminal)
