import unescape from 'unescape-js'
import debounce from '../debounce'
import bellSound from '../bell-sound'
import { BridgeComponent } from '@hotwired/strada'
import keystrokeForKeyboardEvent from '../keystroke_for_keyboard_event'
import { loadGhostty } from '../ghostty'
import GhosttyTerminal from '../ghostty_terminal'

const booleanSettings = [
  'cursorBlink',
  'macOptionIsMeta',
  'rightClickSelectsWord',
  'macOptionClickForcesSelection',
  'copyOnSelect',
  'hideContextMenu',
]

export default class extends BridgeComponent {
  static component = 'terminal'

  initialize() {
    this.fit = debounce(this.fit.bind(this), 50)
  }

  connect() {
    super.connect()
    const connection = (this.connection = {})
    this.send('connect', {}, async ({ data }) => {
      this.profile = data
      this.applyProfile()
      try {
        const module = await loadGhostty()
        if (this.connection !== connection) return
        this.wrapper = document.createElement('div')
        this.wrapper.className = 'ghostty-terminal'
        this.element.append(this.wrapper)
        this.terminal = new GhosttyTerminal(
          module,
          this.wrapper,
          this.settings(),
          {
            onData: (bytes) => this.send('write', { bytes: Array.from(bytes) }),
            onBell: () => bellSound.play(),
            onKey: (event) => this.keybindingHandler(event),
            onResize: (size) => {
              this.size = size
              if (this.ptyStarted) this.send('resize', size)
            },
          }
        )
        // Only spawn the shell once WASM, input handlers, and the first fit are
        // ready. Send the initial grid with the subscription to avoid a 0x0 PTY.
        this.ptyStarted = true
        this.send('data', this.size, ({ data }) => {
          if (this.connection !== connection) return
          this.terminal.write(new Uint8Array(JSON.parse(data.data)))
        })
      } catch (error) {
        if (this.connection !== connection) return
        this.terminal?.dispose()
        this.terminal = null
        this.wrapper?.remove()
        this.element.textContent =
          'Could not start the terminal. Close this window and try again.'
        console.error('Could not initialize libghostty-vt', error)
      }
    })

    this.send('profileChanged', {}, ({ data }) => {
      this.profile = data
      this.applyProfile()
    })
    this.send('settingChanged', {}, ({ data }) => {
      if (!this.profile) return
      if (
        data.property.startsWith('theme.') ||
        data.property === 'keybindings'
      ) {
        this.profile = data.value
      } else {
        this.profile[data.property] = data.value
      }
      this.applyProfile()
    })
  }

  applyProfile() {
    this.keymaps = Object.fromEntries(
      (this.profile.keybindings || []).map((item) => [
        item.keystroke,
        unescape(item.command),
      ])
    )
    document.documentElement.style.setProperty(
      '--background-color',
      this.profile.theme.background
    )
    document.documentElement.style.setProperty(
      '--terminal-padding',
      this.profile.padding
    )
    this.terminal?.updateSettings(this.settings())
    this.fit()
  }

  settings() {
    const settings = { ...this.profile }
    // Ignore this retired preference in profiles saved by older versions.
    delete settings.ligatures
    for (const key of booleanSettings)
      settings[key] = settings[key] === true || settings[key] === 'true'
    settings.fontSize = Number(settings.fontSize)
    settings.scrollback = Number(settings.scrollback)
    settings.fontWeight ||= 'normal'
    settings.fontFamily ||= 'monospace'
    settings.cursorStyle ||= 'block'
    return settings
  }

  disconnect() {
    // No PTY exists when a window closes while WASM is still compiling.
    if (this.ptyStarted) this.send('disconnect')
    this.connection = null
    this.ptyStarted = false
    this.terminal?.dispose()
    this.wrapper?.remove()
    this.terminal = null
    this.wrapper = null
    this.size = null
    super.disconnect()
  }

  onContextMenu(event) {
    if (this.settings().hideContextMenu) event.preventDefault()
  }

  resetFont() {
    this.terminal?.resetFont()
  }
  fit() {
    this.terminal?.fit()
  }

  keybindingHandler(event) {
    const mapping = this.keymaps[keystrokeForKeyboardEvent(event)]
    if (mapping === undefined) return false
    this.send('write', { data: mapping })
    return true
  }

  send(event, data = {}, callback) {
    data.metadata = { url: window.location.href }
    const messageId = this.bridge.send({
      component: this.component,
      event,
      data,
      callback,
    })
    if (callback) this.pendingMessageCallbacks.push(messageId)
  }
}
