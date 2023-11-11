import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "text"

  connect() {
    // ipc.answerMain('active-profile-changed', this.setValue.bind(this));
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.setValue(data)
    })
  }

  setValue(profile) {
    this.element.value = profile[this.element.name] || ''
  }

  change(event) {
    this.send("change", { property: event.target.name, value: event.target.value })
  }
}
