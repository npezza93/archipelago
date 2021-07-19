/* global document, currentProfile */

import {Controller} from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';
import KeybindingController from './keybinding-controller';

export default class extends Controller {
  create() {
    let currentBindings = currentProfile.get('keybindings');
    const capturer = new KeybindingController();
    capturer.indexValue = currentBindings.length;

    capturer.edit();
  }

  destroy() {
    let currentBindings = currentProfile.get('keybindings');
    const activeItem = document.querySelector('[data-controller="keybinding"].active');

    if (activeItem) {
      const answer = confirm("Are you sure?");
      if (answer) {
        delete currentBindings[activeItem.dataset.keybindingIndexValue];
        currentBindings = currentBindings.filter(item => item);
        ipc.callMain('change-setting', {property: 'keybindings', value: currentBindings});
      }
    }
  }
}
