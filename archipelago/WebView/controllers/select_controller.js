import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "select"

  connect() {
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.setValue(data)
    })
  }

  setValue(profile) {
    const currentValue = profile[this.nameValue]
    const option = this.element.querySelector(`option[value='${currentValue}']`);

    if (option) {
      option.selected = true;
    }
  }

  change(event) {
    this.send("change", { property: event.target.name, value: event.target.value })
  }
}
