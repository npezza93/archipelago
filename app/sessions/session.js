/* global window, requestAnimationFrame, requestIdleCallback, document */

const {Emitter, CompositeDisposable, Disposable} = require('event-kit')
const {Terminal} = require('xterm')
const KeymapManager = require('atom-keymap')
const unescape = require('unescape-js')
const ipc = require('electron-better-ipc')

const ProfileManager = require('../configuration/profile-manager')
const {xtermSettings} = require('../configuration/config-file')

Terminal.applyAddon(require('xterm/lib/addons/fit/fit'))

module.exports =
class Session {
  constructor(pref, branch) {
    this.branch = branch
    this.id = Math.random()
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.profileManager = new ProfileManager(pref)
    this.title = ''
    this.pref = pref
    this.pty = ipc.callMain('create-pty')

    this.bindDataListeners()
  }

  get xterm() {
    if (this._xterm) {
      return this._xterm
    }
    const settings = xtermSettings.reduce((settings, property) => {
      settings[property] = this.profileManager.get(property)
      return settings
    }, {})

    this._xterm = new Terminal(settings)

    return this._xterm
  }

  get keymaps() {
    if (this._keymaps) {
      return this._keymaps
    }

    this._keymaps = new KeymapManager()
    this._keymaps.mappings =
      this.profileManager.get('keybindings').reduce((result, item) => {
        result[item.keystroke] = unescape(item.command)
        return result
      }, {})

    return this._keymaps
  }

  resetTheme() {
    this.xterm.setOption('theme', this.profileManager.get('theme'))
  }

  resetBlink() {
    if (this.profileManager.get('cursorBlink')) {
      this.xterm.setOption('cursorBlink', false)
      this.xterm.setOption('cursorBlink', true)
    }
  }

  kill() {
    window.removeEventListener('resize', this.fit.bind(this))

    this.subscriptions.dispose()
    this.emitter.dispose()
    this.xterm.dispose()
    this.pref.events.dispose()

    return this.pty.then(id => ipc.callMain('kill-pty', id))
  }

  fit() {
    this.xterm.fit()
    this.pty.then(id => ipc.callMain(`resize-${id}`, {cols: this.xterm.cols, rows: this.xterm.rows}))
  }

  on(event, handler) {
    return this.emitter.on(event, handler)
  }

  keybindingHandler(e) {
    let caught = false
    const mapping = this.keymaps.mappings[this.keymaps.keystrokeForKeyboardEvent(e)]

    if (mapping) {
      this.pty.then(id => ipc.callMain(`write-${id}`, mapping))
      caught = true
    }

    return !caught
  }

  bindScrollListener() {
    const scrollbarFadeEffect = () => {
      clearTimeout(this.scrollbarFade)
      this.scrollbarFade = setTimeout(
        () => this.xterm.element.classList.remove('scrolling'),
        600
      )
      this.xterm.element.classList.add('scrolling')
    }

    this.xterm.element.addEventListener('wheel', scrollbarFadeEffect.bind(this), {passive: true})

    return new Disposable(() => {
      this.xterm.element.removeEventListener('wheel', scrollbarFadeEffect.bind(this), {passive: true})
    })
  }

  onDidFocus(callback) {
    return this.emitter.on('did-focus', callback)
  }

  onDidChangeTitle(callback) {
    return this.emitter.on('did-change-title', callback)
  }

  onDidExit(callback) {
    return this.emitter.on('did-exit', callback)
  }

  onData(callback) {
    return this.emitter.on('data', callback)
  }

  bindDataListeners() {
    this.xterm.attachCustomKeyEventHandler(this.keybindingHandler.bind(this))
    window.addEventListener('resize', this.fit.bind(this))

    this.xterm.on('data', data => {
      this.pty.then(id => ipc.callMain(`write-${id}`, data))
    })

    this.xterm.on('focus', () => {
      this.fit()
      requestAnimationFrame(() => {
        requestIdleCallback(() => this.resetBlink())
      })
      this.emitter.emit('did-focus')
    })

    this.xterm.on('title', title => {
      this.title = title
      this.emitter.emit('did-change-title', title)
    })

    this.xterm.on('selection', () => {
      if (this.profileManager.get('copyOnSelect')) {
        document.execCommand('copy')
      }
    })

    this.pty.then(id => {
      ipc.answerMain(`write-${id}`, data => {
        this.xterm.write(data)
        this.emitter.emit('data')
      })

      ipc.answerMain(`exit-${id}`, () => this.emitter.emit('did-exit'))
    })

    xtermSettings.forEach(field => {
      this.subscriptions.add(
        this.profileManager.onDidChange(field, newValue => {
          this.xterm.setOption(field, newValue)
        })
      )
    })
  }
}
