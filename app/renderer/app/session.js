/* global document, navigator */
import {clipboard, shell} from 'electron'
import {ipcRenderer as ipc} from 'electron-better-ipc'
import {activeWindow, platform} from 'electron-util'
import {CompositeDisposable, Disposable} from 'event-kit'
import {Terminal} from 'xterm'
import unescape from 'unescape-js'
import debouncer from 'debounce-fn'
import keystrokeForKeyboardEvent from 'keystroke-for-keyboard-event'
import autoBind from 'auto-bind'
import Color from 'color'
import {FitAddon} from 'xterm-addon-fit'
import {WebLinksAddon} from 'xterm-addon-web-links'
import {WebglAddon} from 'xterm-addon-webgl'
import {LigaturesAddon} from 'xterm-addon-ligatures'
import CurrentProfile from '../utils/current-profile'

export default class Session {
  constructor() {
    this.currentProfile = new CurrentProfile()
    this.id = Math.random()
    this.subscriptions = new CompositeDisposable()
    this.title = ''
    this.ptyId = ipc.callMain('pty-create', {sessionId: this.id, sessionWindowId: activeWindow().id})
    this.fitAddon = new FitAddon()
    this.webglAddon = new WebglAddon()
    this.xterm = new Terminal(this.settings())
    this.ligaturesAddon = new LigaturesAddon()
    this.xterm.loadAddon(this.fitAddon)

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
    this._keymaps =
      this.currentProfile.get('keybindings').reduce((result, item) => {
        result[item.keystroke] = unescape(item.command)
        return result
      }, {})
  }

  settings() {
    return this.applySettingModifiers(
      this.currentProfile.xtermSettings.reduce((settings, property) => {
        settings[property] = this.currentProfile.get(property)
        return settings
      }, {windows: this.isWindows()})
    )
  }

  isWindows() {
    return ['Windows', 'Win16', 'Win32', 'WinCE'].includes(navigator.platform)
  }

  applySettingModifiers(defaultSettings) {
    const {background} = defaultSettings.theme
    defaultSettings.allowTransparency = this.allowTransparency(background)

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
      this._wrapperElement.append(this._xtermElement)
      this._container.append(this._wrapperElement)
      this.xterm.open(this._xtermElement)
      if (this.currentProfile.get('experimentalWebglRenderer')) {
        this.xterm.loadAddon(this.webglAddon)
      }

      if (this.currentProfile.get('ligatures')) {
        this.xterm.loadAddon(this.ligaturesAddon)
      }

      this.bindScrollListener()
      this.xterm.focus()
      return
    }

    this._wrapperElement.remove()
    this._container = container
    this._container.append(this._wrapperElement)
    this.xterm.focus()
  }

  resetTheme() {
    this.xterm.setOption('allowTransparency', this.settings().allowTransparency)
    this.xterm.setOption('theme', this.settings().theme)
  }

  async kill() {
    this.subscriptions.dispose()

    if (this.xterm) { this.xterm.dispose() } // use safe nav

    if (this._wrapperElement) {
      this._wrapperElement.remove()
      this._wrapperElement = null
    }

    const ptyId = await this.ptyId
    this.xterm = null

    await ipc.send(`pty-kill-${ptyId}`)
  }

  fit() {
    this.fitAddon.fit()
    ipc.send(`pty-resize-${this.id}`, {cols: this.xterm.cols, rows: this.xterm.rows})
  }

  allowTransparency(background) {
    const color = new Color(background)
    let allowTransparency

    allowTransparency = color.alpha() !== 1

    return allowTransparency
  }

  keybindingHandler(event) {
    let caught = false
    const mapping = this.keymaps[keystrokeForKeyboardEvent(event)]

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

    this.subscriptions.add(new Disposable(() => {
      this.xterm.element.removeEventListener('wheel', scrollbarFadeEffect.bind(this), {passive: true})
    }))
  }

  setTitle(title) {
    this.title = title
  }

  resetBlink() {
    debouncer(() => {
      if (this.currentProfile.get('cursorBlink')) {
        this.xterm.setOption('cursorBlink', false)
        this.xterm.setOption('cursorBlink', true)
      }
    }, {wait: 50})()
  }

  copySelection() {
    if (this.currentProfile.get('copyOnSelect') && this.xterm.getSelection()) {
      clipboard.writeText(this.xterm.getSelection())
    }
  }

  onFocus(callback) {
    return this.xterm._core.onFocus(callback)
  }

  onTitle(callback) {
    return this.xterm.onTitleChange(callback)
  }

  onExit(callback) {
    ipc.on(`pty-exit-${this.id}`, callback)
    return new Disposable(() => {
      ipc.removeListener(`pty-exit-${this.id}`, callback)
    })
  }

  onData(callback) {
    return this.xterm.onData(callback)
  }

  onSelection(callback) {
    return this.xterm.onSelectionChange(callback)
  }

  onSettingChanged({property, value}) {
    if (this.currentProfile.xtermSettings.includes(property)) {
      this.xterm.setOption(property, value)
    } else if (property === 'keybindings') {
      this.resetKeymaps()
    } else if (property.startsWith('theme.')) {
      this.resetTheme()
    }
  }

  onActiveProfileChange() {
    this.resetKeymaps()
    this.xterm.setOption('allowTransparency', this.settings().allowTransparency)
    for (const property in this.settings()) {
      this.xterm.setOption(property, this.settings()[property])
    }
  }

  writePtyData(event, data) {
    this.xterm.write(data)
  }

  bindListeners() {
    this.webLinksAddon = new WebLinksAddon((event, uri) => shell.openExternal(uri))

    this.xterm.loadAddon(this.webLinksAddon)
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
    this.subscriptions.add(new Disposable(ipc.answerMain('active-profile-changed', this.onActiveProfileChange)))
    this.subscriptions.add(new Disposable(ipc.answerMain('setting-changed', this.onSettingChanged)))
  }
}