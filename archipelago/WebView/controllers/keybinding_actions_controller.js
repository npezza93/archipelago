import { BridgeComponent } from "@hotwired/strada"
import KeybindingController from './keybinding_controller'

export default class extends BridgeComponent {
  static component = "keybinding-actions"

  connect() {
    super.connect()
  }

  create() {
    const capturer = new KeybindingController();
    capturer.indexValue = document.querySelectorAll('[data-controller="keybinding"]').length;

    capturer.edit();
  }

  destroy() {
    const activeItem = document.querySelector('[data-controller="keybinding"].active');

    if (activeItem) {
      const answer = window.confirm('Are you sure you want to delete this keybinding?');
      if (answer) {
        this.send("change", { index: Number(activeItem.dataset.keybindingIndexValue) })
      }
    }
  }
}
