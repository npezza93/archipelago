/* global currentProfile */

import {Controller} from '@hotwired/stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  static targets = ['input']

  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this));
    this.setValue();
  }

  setValue() {
    const currentValue = currentProfile.get(this.inputTarget.name);

    this.inputTarget.checked = currentValue;
  }

  change(event) {
    ipc.callMain('change-setting', {property: event.target.name, value: event.target.checked});
  }
}
