import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "profile-actions"

  connect() {
    super.connect()
  }

  create() {
    this.send("create", {})
    setTimeout(() => {
      document.querySelector("#profiles article > div.active").
        dispatchEvent(new MouseEvent("dblclick"))
    }, 30)
  }

  destroy() {
    if (document.querySelectorAll("#profiles article > div").length > 1) {
      const answer = window.confirm('Are you sure you want to delete this profile?');
      if (answer) {
        this.send("destroy", {})
      }
    }
  }
}
