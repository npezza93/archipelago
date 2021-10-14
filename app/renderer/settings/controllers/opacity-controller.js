/* global currentProfile */

import color from 'color';
import {Controller} from '@hotwired/stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this));
    this.setValue();
  }

  setValue() {
    this.element.value = this.currentColor.alpha();
  }

  change(event) {
    let color = this.currentColor.alpha(event.target.value);

    ipc.callMain('change-setting', {property: event.target.name, value: color.rgb().string()});
  }

  get currentColor() {
    return color(currentProfile.get(this.element.name));
  }
}
