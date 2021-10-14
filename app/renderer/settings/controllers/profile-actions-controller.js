/* global currentProfile, confirm */

import {Controller} from '@hotwired/stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';
import ProfileController from './profile-controller';

export default class extends Controller {
  create() {
    ipc.callMain('create-profile').then(() => {
      const capturer = new ProfileController();
      capturer.idValue = currentProfile.get('id');
      capturer.nameValue = currentProfile.get('name');

      capturer.edit();
    });
  }

  destroy() {
    const answer = confirm('Are you sure?');
    if (answer) {
      ipc.callMain('remove-profile', currentProfile.activeProfileId);
    }
  }
}
