/* global document */
import {clipboard} from 'electron'
import ipc from 'electron-better-ipc'
import {activeWindow, platform} from 'electron-util'
import {CompositeDisposable, Disposable} from 'event-kit'
import {Terminal} from 'xterm'
import unescape from 'unescape-js'
import keystrokeForKeyboardEvent from 'keystroke-for-keyboard-event'
import autoBind from 'auto-bind'
import CurrentProfile from './current-profile'

Terminal.applyAddon(require('xterm/lib/addons/fit/fit'))
Terminal.applyAddon(require('xterm/lib/addons/search/search'))
Terminal.applyAddon(require('xterm/lib/addons/webLinks/webLinks'))
Terminal.applyAddon(require('xterm/lib/addons/winptyCompat/winptyCompat'))

export default class Session {
  constructor(type, branch) {
    this.branch = branch
    this.currentProfile = new CurrentProfile()
    this.id = Math.random()
    this.subscriptions = new CompositeDisposable()
    this.title = ''
    this.ptyId = ipc.callMain('pty-create', {sessionId: this.id, sessionWindowId: activeWindow().id})
    this.type = type || 'default'
    this.xterm = new Terminal(this.settings())
    this.resetKeymaps()
    autoBind(this)

    this.bindListeners()
  }

  get className() {
    return 'Session'
  }

  get keymaps() {
    if (this._keymaps === undefined) {
      this.resetKeymaps()
    }

    return this._keymaps
  }

  resetKeymaps() {
    ipc.callMain('keybindings').then(keybindings => {
      this._keymaps =
        keybindings.reduce((result, item) => {
          result[item.keystroke] = unescape(item.command)
          return result
        }, {})
    })
  }

  settings() {
    return this.applySettingModifiers(
      this.currentProfile.xtermSettings.reduce((settings, property) => {
        settings[property] = this.currentProfile.get(property)
        return settings
      }, {})
    )
  }

  applySettingModifiers(defaultSettings) {
    if (this.type === 'visor') {
      defaultSettings.allowTransparency = this.currentProfile.get('visor.allowTransparency')
      defaultSettings.theme.background = this.currentProfile.get('visor.background')
    }

    return defaultSettings
  }

  attach(container) {
    // The container did not change, do nothing
    if (this._container === container) {
      return
    }

    // Attach has not occured yet
    if (!this._wrapperElement) {
      this._container = container
      this._wrapperElement = document.createElement('div')
      this._wrapperElement.classList = 'wrapper'
      this._xtermElement = document.createElement('div')
      this._xtermElement.classList = 'wrapper'
      this._wrapperElement.appendChild(this._xtermElement)
      this._container.appendChild(this._wrapperElement)
      this.xterm.open(this._xtermElement)
      this.xterm.focus()
      return
    }

    this._container.removeChild(this._wrapperElement)
    this._container = container
    this._container.appendChild(this._wrapperElement)
    this.xterm.focus()
  }

  resetTheme() {
    this.xterm.setOption('theme', this.settings().theme)
  }

  async kill() {
    this.subscriptions.dispose()
    this.xterm.dispose()

    if (this._wrapperElement) {
      this._container.removeChild(this._wrapperElement)
      this._wrapperElement = null
    }

    const ptyId = await this.ptyId

    await ipc.callMain(`pty-kill-${ptyId}`)
  }

  fit() {
    this.xterm.fit()
    ipc.send(`pty-resize-${this.id}`, {cols: this.xterm.cols, rows: this.xterm.rows})
  }

  searchNext(query, options) {
    this.xterm.findNext(query, options)
  }

  searchPrevious(query, options) {
    this.xterm.findPrevious(query, options)
  }

  keybindingHandler(e) {
    let caught = false
    const mapping = this.keymaps[keystrokeForKeyboardEvent(e)]

    if (mapping) {
      ipc.send(`pty-write-${this.id}`, mapping)
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
    ipc.callMain('cursor-blink').then(cursorBlink => {
      if (cursorBlink) {
        this.xterm.setOption('cursorBlink', false)
        this.xterm.setOption('cursorBlink', true)
      }
    })
  }

  copySelection() {
    ipc.callMain('copy-on-select').then(copyOnSelect => {
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
    ipc.on(`pty-exit-${this.id}`, callback)
    return new Disposable(() => {
      ipc.removeListener(`pty-exit-${this.id}`, callback)
    })
  }

  onData(callback) {
    return this.xterm.addDisposableListener('data', callback)
  }

  onSelection(callback) {
    return this.xterm.addDisposableListener('selection', callback)
  }

  onSettingChanged({property, value}) {
    if (this.currentProfile.xtermSettings.indexOf(property) >= 0) {
      this.xterm.setOption(property, value)
    } else if (property === 'keybindings') {
      this.resetKeymaps()
    } else if (property.startsWith('theme.')) {
      this.resetTheme()
    }
  }

  onActiveProfileChange() {
    this.resetKeymaps()
    for (const property in this.settings()) {
      this.xterm.setOption(property, this.settings()[property])
    }
  }

  writePtyData(event, data) {
    this.xterm.write(data)
  }

  bindListeners() {
    this.xterm.winptyCompatInit()
    this.xterm.webLinksInit((event, uri) => {
      if (document.querySelector('webview')) {
        document.querySelector('webview').remove()
      }

      if (platform({macos: event.metaKey, default: event.ctrlKey})) {
        const webview = document.createElement('webview')
        webview.setAttribute('src', uri)
        document.querySelector('body').appendChild(webview)
      }
    })
    this.xterm.attachCustomKeyEventHandler(this.keybindingHandler)

    ipc.on(`pty-data-${this.id}`, this.writePtyData)
    this.subscriptions.add(new Disposable(() => {
      ipc.removeListener(`pty-data-${this.id}`, this.writePtyData)
    }))
    this.subscriptions.add(this.onData(data => {
      ipc.send(`pty-write-${this.id}`, data)
    }))
    this.subscriptions.add(this.onTitle(this.setTitle))
    this.subscriptions.add(this.onFocus(this.fit))
    this.subscriptions.add(this.onFocus(this.resetBlink))
    this.subscriptions.add(this.onSelection(this.copySelection))
    ipc.answerMain('active-profile-changed', this.onActiveProfileChange)
    ipc.answerMain('setting-changed', this.onSettingChanged)
  }
}
