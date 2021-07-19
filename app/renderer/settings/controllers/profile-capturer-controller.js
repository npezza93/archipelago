import {Controller} from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  static targets = ['name']
  static values = { id: Number }

  connect() {
    this.nameTarget.focus();
  }

  close() {
    this.element.remove();
  }

  save() {
    ipc.callMain('set-profile-name', {id: this.idValue, name: this.nameTarget.value});

    this.close();
  }
}
