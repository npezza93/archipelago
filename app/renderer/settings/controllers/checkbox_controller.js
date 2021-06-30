import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  static targets = ['input']

  connect() {
    const currentValue = currentProfile.get(this.inputTarget.name)

    this.inputTarget.checked = currentValue
  }
}
