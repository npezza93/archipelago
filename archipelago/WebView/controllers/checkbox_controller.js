import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "checkbox"
  static targets = ['input']

  connect() {
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.setValue(data)
    })
  }

  setValue(profile) {
    const currentValue = profile[this.inputTarget.name];

    this.inputTarget.checked = currentValue;
  }

  change(event) {
    this.send("change", { property: event.target.name, value: event.target.checked })
  }
}
