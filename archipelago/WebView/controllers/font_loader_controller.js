import { BridgeComponent } from '@hotwired/strada'

export default class extends BridgeComponent {
  static component = 'font-loader'
  static outlets = ['terminal']

  connect() {
    super.connect()
    this.fontLoads ||= new Map()
    this.send('load', {}, ({ data }) => this.loadFont(data))
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
      })()
      this.fontLoads.set(font.name, loading)
    }
    try {
      await loading
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
