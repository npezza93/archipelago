/* global window, requestAnimationFrame, requestIdleCallback, document */

const {remote} = require('electron')
const os = require('os')
const {spawn} = require('node-pty')
const {Emitter, CompositeDisposable, Disposable} = require('event-kit')
const {Terminal} = require('xterm')
const KeymapManager = require('atom-keymap')
const unescape = require('unescape-js')

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

    this.bindDataListeners()
  }

  get pty() {
    if (this._pty) {
      return this._pty
    }

    const shell =
      this.profileManager.get('shell') ||
      process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL']
    const lang = (remote && remote.app && remote.app.getLocale()) || ''

    this._pty = spawn(
      shell, this.profileManager.get('shellArgs').split(','), {
        name: 'xterm-256color',
        cwd: process.env.HOME,
        env: {
          LANG: lang + '.UTF-8',
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          ...process.env
        }
      }
    )

    return this._pty
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

  defaultXtermSettings() {
    return this.schema.xtermSettings().reduce((settings, property) => {
      settings[property] = this.profileManager.get(property)
      return settings
    }, {})
  }

  visorXtermSettings() {
    return {
      ...this.defaultXtermSettings(),
      allowTransparency: this.profileManager.get('visor.allowTransparency'),
      theme: {...this.profileManager.get('theme'), background: this.profileManager.get('visor.background')}
    }
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
    this.pty.kill()
    this.xterm.dispose()
    this.pref.events.dispose()
  }

  fit() {
    this.xterm.fit()
    this.pty.resize(this.xterm.cols, this.xterm.rows)
  }

  on(event, handler) {
    return this.emitter.on(event, handler)
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
      try {
        this.pty.write(data)
      } catch (error) {}
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

    this.pty.on('data', data => {
      this.xterm.write(data)
      this.emitter.emit('data')
    })

    this.pty.on('exit', () => {
      this.emitter.emit('did-exit')
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
