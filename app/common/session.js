const {clipboard} = require('electron')
const {CompositeDisposable, Disposable} = require('event-kit')
const {Terminal} = require('xterm')
const KeymapManager = require('atom-keymap')
const unescape = require('unescape-js')

const ProfileManager = require('../common/profile-manager')
const Pty = require('../common/pty')
const {xtermSettings} = require('../common/config-file')

Terminal.applyAddon(require('xterm/lib/addons/fit/fit'))

module.exports =
class Session {
  constructor(pref, type, branch) {
    this.branch = branch
    this.id = Math.random()
    this.subscriptions = new CompositeDisposable()
    this.profileManager = new ProfileManager(pref)
    this.title = ''
    this.pref = pref
    this.pty = new Pty(pref)
    this.type = type || 'default'

    this.bindDataListeners()
  }

  get xterm() {
    if (this._xterm) {
      return this._xterm
    }

    this._xterm = new Terminal(this.settings())

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

  settings() {
    return this.applySettingModifiers(
      xtermSettings.reduce((settings, property) => {
        settings[property] = this.profileManager.get(property)
        return settings
      }, {})
    )
  }

  applySettingModifiers(defaultSettings) {
    if (this.type === 'visor') {
      defaultSettings = {
        ...defaultSettings,
        allowTransparency: this.profileManager.get('visor.allowTransparency'),
        theme: {
          ...this.profileManager.get('theme'),
          background: this.profileManager.get('visor.background')
        }
      }
    }

    return defaultSettings
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

  copySelection() {
    if (this.profileManager.get('copyOnSelect')) {
      clipboard.writeText(this.xterm.getSelection())
    }
  }

  kill() {
    this.subscriptions.dispose()
    this.xterm.dispose()
    this.pref.events.dispose()

    return this.pty.kill()
  }

  fit() {
    this.xterm.fit()
    this.pty.resize(this.xterm.cols, this.xterm.rows)
  }

  keybindingHandler(e) {
    let caught = false
    const mapping = this.keymaps.mappings[this.keymaps.keystrokeForKeyboardEvent(e)]

    if (mapping) {
      this.pty.write(mapping)
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

  onFocus(callback) {
    return this.xterm.addDisposableListener('focus', callback)
  }

  onTitle(callback) {
    return this.xterm.addDisposableListener('title', callback)
  }

  onExit(callback) {
    return this.pty.onExit(callback)
  }

  onData(callback) {
    return this.xterm.addDisposableListener('data', callback)
  }

  onSelection(callback) {
    return this.xterm.addDisposableListener('selection', callback)
  }

  bindDataListeners() {
    this.xterm.attachCustomKeyEventHandler(this.keybindingHandler.bind(this))

    this.subscriptions.add(this.onData(data => this.pty.write(data)))
    this.subscriptions.add(this.onTitle(title => this.title = title))
    this.subscriptions.add(this.pty.onData(data => this.xterm.write(data)))
    this.subscriptions.add(this.onFocus(this.fit.bind(this)))
    this.subscriptions.add(this.onFocus(this.resetBlink.bind(this)))
    this.subscriptions.add(this.onSelection(this.copySelection.bind(this)))

    xtermSettings.forEach(field => {
      this.subscriptions.add(
        this.profileManager.onDidChange(field, newValue => {
          this.xterm.setOption(field, newValue)
        })
      )
    })
  }
}
