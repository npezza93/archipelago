import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "radio"
  static values = { name: String }

  connect() {
    // ipc.answerMain('active-profile-changed', this.setValue.bind(this))
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.setValue(data)
    })
  }

  setValue(profile) {
    const currentValue = profile[this.nameValue]
    const element = this.element.querySelector(`[value=${currentValue}]`)

    element.checked = true
  }

  change(event) {
    this.send("change", { property: event.target.name, value: event.target.value })
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
