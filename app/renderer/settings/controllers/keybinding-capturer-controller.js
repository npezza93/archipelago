/* global document, currentProfile */

import {Controller} from '@hotwired/stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';
import keystrokeForKeyboardEvent from '@npezza93/keystroke-for-keyboard-event';

import formatAccelerator from '../../utils/format-accelerator';

export default class extends Controller {
  static targets = ['command', 'keystroke']
  static values = { index: Number }

  connect() {
    this.commandTarget.focus();
  }

  close() {
    this.element.remove();
  }

  save() {
    let currentBindings = currentProfile.get('keybindings');
    currentBindings[this.indexValue] = {
      keystroke: this.keystrokeTarget.getAttribute('value'),
      command: this.commandTarget.value,
    };
    ipc.callMain('change-setting', {property: 'keybindings', value: currentBindings});
    this.close();
  }

  startCapture() {
    this.keystrokeTarget.innerHTML = 'Recording';
    this.keystrokeTarget.classList.add('recording');
    ipc.send('disable-shortcuts');
    let newKeystroke = null;

    const listener = event => {
      event.preventDefault();
      event.stopPropagation();
      const key = keystrokeForKeyboardEvent(event);

      if (newKeystroke !== key) {
        newKeystroke = key;
        this.keystrokeTarget.setAttribute('value', key);
        this.keystrokeTarget.innerHTML = formatAccelerator(key);
      }
    };

    const remover = () => {
      ipc.send('enable-shortcuts');
      this.keystrokeTarget.classList.remove('recording');
      document.removeEventListener('keydown', listener);
      document.removeEventListener('keyup', remover);
    };

    document.addEventListener('keydown', listener);
    document.addEventListener('keyup', remover);
  }
}
