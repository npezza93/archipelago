import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "font-loader"
  static outlets = [ "terminal" ]

  connect() {
    super.connect()
    window.fonts = []

    if (window.font) {
      this.loadFont(window.font)
    }
    this.send("load", {}, ({data}) => {
      this.loadFont(data)
    })
  }

  async loadFont(font) {
    const binaryString = atob(font.raw)
    let bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }

    const fontFace = new FontFace(font.name, bytes.buffer);

    if (!document.fonts.has(fontFace)) {
      await fontFace.load()
      document.fonts.add(fontFace)
      window.fonts = [...window.fonts, font]
    }

    window.font = font
    requestAnimationFrame(() => this.terminalOutlet.resetFont())
  }

  send(event, data = {}, callback) {
    data.metadata = { url: window.location.href }

    const message = { component: this.component, event, data, callback }
    const messageId = this.bridge.send(message)
    if (callback) {
      this.pendingMessageCallbacks.push(messageId)
    }
  }
}
