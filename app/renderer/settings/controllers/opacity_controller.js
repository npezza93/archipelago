import Color from 'color';
import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  connect() {
    this.element.value = Color(currentProfile.get(this.element.name)).alpha()
  }
}
