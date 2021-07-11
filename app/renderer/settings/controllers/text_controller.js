import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this))
    this.setValue()
  }

  setValue() {
    this.element.value = currentProfile.get(this.element.name)
  }

  change(event) {
    ipc.callMain('change-setting', {property: event.target.name, value: event.target.value})
  }
}
