import { BridgeComponent } from '@hotwired/strada'

export default class extends BridgeComponent {
  static component = 'font-loader'
  static outlets = ['terminal']

  connect() {
    super.connect()
    this.abort = new AbortController()
    this.fontLoads ||= new Map()
    window.fonts ||= []

    const loadInitialFont = () => {
      if (window.font) this.loadFont(window.font)
    }
    // The native user script assigns window.font at DOMContentLoaded. A
    // deferred application bundle can connect Stimulus before that event.
    if (document.readyState !== 'complete') {
      document.addEventListener('DOMContentLoaded', loadInitialFont, {
        once: true,
        signal: this.abort.signal,
      })
    }
    loadInitialFont()

    this.send('load', {}, ({ data }) => this.loadFont(data))
  }

  disconnect() {
    this.abort.abort()
    super.disconnect()
  }

  async loadFont(font) {
    let loading = this.fontLoads.get(font.name)
    if (!loading) {
      loading = (async () => {
        const bytes = Uint8Array.from(atob(font.raw), (char) =>
          char.charCodeAt(0)
        )
        const face = await new FontFace(font.name, bytes.buffer).load()
        document.fonts.add(face)
        window.fonts.push(font)
      })()
      this.fontLoads.set(font.name, loading)
    }
    try {
      await loading
      window.font = font
      requestAnimationFrame(() => {
        if (this.hasTerminalOutlet) this.terminalOutlet.resetFont()
      })
    } catch (error) {
      this.fontLoads.delete(font.name)
      console.error(`Could not load terminal font ${font.name}`, error)
    }
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
