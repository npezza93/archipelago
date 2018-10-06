const {clipboard} = require('electron')
const {CompositeDisposable, Disposable} = require('event-kit')
const ipc = require('electron-better-ipc')
const {Terminal} = require('xterm')
const unescape = require('unescape-js')
const keystrokeForKeyboardEvent = require('keystroke-for-keyboard-event')

const Pty = require('../common/pty')
const {xtermSettings} = require('../common/config-file')

Terminal.applyAddon(require('xterm/lib/addons/fit/fit'))

module.exports =
class Session {
  constructor(type, branch) {
    this.branch = branch
    this.id = Math.random()
    this.subscriptions = new CompositeDisposable()
    this.title = ''
    this.pty = new Pty()
    this.type = type || 'default'
    this.xterm = new Terminal(this.settings())

    this.bindDataListeners()
  }

  get keymaps() {
    if (this._keymaps) {
      return this._keymaps
    }

    this._keymaps =
      ipc.sendSync('get-preferences-sync', 'keybindings').reduce((result, item) => {
        result[item.keystroke] = unescape(item.command)
        return result
      }, {})

    return this._keymaps
  }

  settings() {
    return this.applySettingModifiers(
      xtermSettings.reduce((settings, property) => {
        settings[property] = ipc.sendSync('get-preferences-sync', property)
        return settings
      }, {})
    )
  }

  applySettingModifiers(defaultSettings) {
    if (this.type === 'visor') {
      defaultSettings = {
        ...defaultSettings,
        allowTransparency: ipc.sendSync('get-preferences-sync', 'visor.allowTransparency'),
        theme: {
          ...ipc.sendSync('get-preferences-sync', 'theme'),
          background: ipc.sendSync('get-preferences-sync', 'visor.background')
        }
      }
    }

    return defaultSettings
  }

  resetTheme() {
    this.xterm.setOption('theme', ipc.sendSync('get-preferences-sync', 'theme'))
  }

  kill() {
    this.subscriptions.dispose()
    this.xterm.dispose()

    return this.pty.kill()
  }

  fit() {
    this.xterm.fit()
    this.pty.resize(this.xterm.cols, this.xterm.rows)
  }

  keybindingHandler(e) {
    let caught = false
    const mapping = this.keymaps[keystrokeForKeyboardEvent(e)]

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

  setTitle(title) {
    this.title = title
  }

  resetBlink() {
    ipc.callMain('get-preferences-async', 'cursorBlink').then(cursorBlink => {
      if (cursorBlink) {
        this.xterm.setOption('cursorBlink', false)
        this.xterm.setOption('cursorBlink', true)
      }
    })
  }

  copySelection() {
    ipc.callMain('get-preferences-async', 'copyOnSelect').then(copyOnSelect => {
      if (copyOnSelect) {
        clipboard.writeText(this.xterm.getSelection())
      }
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
    this.subscriptions.add(this.onTitle(title => this.setTitle(title)))
    this.subscriptions.add(this.pty.onData(data => this.xterm.write(data)))
    this.subscriptions.add(this.onFocus(this.fit.bind(this)))
    this.subscriptions.add(this.onFocus(this.resetBlink.bind(this)))
    this.subscriptions.add(this.onSelection(this.copySelection.bind(this)))

    // xtermSettings.forEach(field => {
    //   this.subscriptions.add(
    //     this.profileManager.onDidChange(field, newValue => {
    //       this.xterm.setOption(field, newValue)
    //     })
    //   )
    // })
  }
}
