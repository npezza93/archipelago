import Color from 'color';
import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this))
    this.setValue()
  }

  setValue() {
    this.element.value = this.currentColor.hex()
  }

  change(event) {
    let color = Color(event.target.value)
    const alpha = this.currentColor.alpha()
    if (alpha < 1.0) {
      color = color.alpha(alpha)
    }

    ipc.callMain('change-setting', {property: event.target.name, value: color.rgb().string()})
  }

  get currentColor() {
    return Color(currentProfile.get(this.element.name))
  }
}
