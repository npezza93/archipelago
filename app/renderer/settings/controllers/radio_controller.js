import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  static values = { name: String }

  connect() {
    const currentValue = currentProfile.get(this.nameValue)
    const element = this.element.querySelector(`[value=${currentValue}]`)

    element.checked = true
  }
}
