import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "radio"
  static values = { name: String }

  connect() {
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
}
