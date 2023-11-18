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
    this.send("change", {}, ({data}) => {
      let existingFont = window.fonts.find((font) => font.name == data.name)

      if (!existingFont) {
        this.loadFont(data)
      }
    })
  }

  loadFont(font) {
    let css = `@font-face {
      font-family: '${font.name}';
      src: url('data:font/${font.format};base64,${font.base64}');
    }`

    let inits = `<div style="position:fixed;top:100000px;left:1000000px;font-family:'${font.name}'">${font.name}</div>`

    let style = document.createElement('style');
    style.innerHTML = css
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', inits)
    window.fonts = [...window.fonts, font]
    window.font = font
    setTimeout(() => this.terminalOutlet.resetFont(), 130)
  }

  send(event, data = {}, callback) {
    data.metadata = { url: "archipelago-1" }

    const message = { component: this.component, event, data, callback }
    const messageId = this.bridge.send(message)
    if (callback) {
      this.pendingMessageCallbacks.push(messageId)
    }
  }
}
