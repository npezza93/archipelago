import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  static values = { name: String }

  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this))
    this.setValue()
  }

  setValue() {
    const currentValue = currentProfile.get(this.nameValue)
    const element = this.element.querySelector(`[value=${currentValue}]`)

    element.checked = true
  }

  change(event) {
    ipc.callMain('change-setting', {property: event.target.name, value: event.target.value})
  }
}
