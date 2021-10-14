/* global document */

import {Controller} from '@hotwired/stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  static values = { name: String, id: Number }

  select() {
    document.querySelectorAll('#profiles article > div').forEach(row => {
      row.classList.remove('active');
    });
    this.element.classList.add('active');
    ipc.callMain('set-active-profile', this.idValue);
  }

  edit() {
    document.body.insertAdjacentHTML('beforeend', `<div class="backdrop" data-controller='profile-capturer' data-profile-capturer-id-value=${this.idValue}>
      <div class='modal'>
        <div class='flex flex-col h-full w-full'>
          <div class='flex-1 flex flex-col w-full align-center gap-10 mt-15'>
            <input type="text" name="name" value="${this.nameValue || ''}" autofocus class='w-60p' data-profile-capturer-target='name'>
          </div>
          <div class='footer flex flex-row justify-end'>
            <button class='cancel' data-action='profile-capturer#close'>Cancel</button>
            <button class='ok' data-action='profile-capturer#save'>OK</button>
          </div>
        </div>
      </div>
    </div>`);
  }
}
