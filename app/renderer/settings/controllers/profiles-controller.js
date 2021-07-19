/* global document, currentProfile */

import {Controller} from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this));
    ipc.answerMain('profile-name-changed', this.setValue.bind(this));
    ipc.answerMain('profile-removed', this.setValue.bind(this));

    this.setValue();
  }

  setValue() {
    const article = this.element.querySelector('article');
    const active = currentProfile.activeProfileId - 1;
    article.innerHTML = '';

    currentProfile.allProfiles.forEach(profile => {
      article.insertAdjacentHTML('beforeend', `<div data-controller='profile' data-action='click->profile#select dblclick->profile#edit' data-profile-name-value=${profile.name} data-profile-id-value=${profile.id}>
        <div>${profile.name || 'New Profile'}</div>
      </div>`);
    });
    const node = document.querySelectorAll('[data-controller="profile"]')[active];
    if (node) {
      node.classList.add('active');
    }
  }
}
