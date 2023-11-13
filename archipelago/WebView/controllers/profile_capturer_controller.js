import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "profile-capturer"
  static targets = ['name']
  static values = { id: Number }

  connect() {
    super.connect()
  }

  save() {
    this.send("change", {id: this.idValue, name: this.nameTarget.value})

    this.element.close();
  }
}
