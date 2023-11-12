import { BridgeComponent } from "@hotwired/strada"
import KeybindingController from './keybinding_controller'

export default class extends BridgeComponent {
  static component = "keybinding-actions"

  connect() {
    // ipc.answerMain('active-profile-changed', this.setValue.bind(this))
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.keybindings = data.keybindings
    })
  }

  create() {
    const capturer = new KeybindingController();
    capturer.indexValue = this.keybindings.length;

    capturer.edit();
  }

  destroy() {
    const activeItem = document.querySelector('[data-controller="keybinding"].active');

    if (activeItem) {
      const answer = confirm('Are you sure?');
      if (answer) {
        delete this.keybindings[activeItem.dataset.keybindingIndexValue];
        this.keybindings = this.keybindings.filter(item => item);
        this.send("change", { property: "keybindings", value: this.keybindings })
      }
    }
  }
}
