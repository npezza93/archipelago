import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  connect() {
    const currentValue = currentProfile.get(this.element.name)

    const option = this.element.querySelector(`option[value='${currentValue}']`)

    if (option) {
      option.selected = true
    }
  }
}
