/* global document, currentProfile */

import {Controller} from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';
import ProfileController from './profile-controller';

export default class extends Controller {
  create() {
    ipc.callMain('create-profile').then(({profiles, activeProfileId}) => {
      const capturer = new ProfileController();
      capturer.idValue = currentProfile.get('id')
      capturer.nameValue = currentProfile.get('name')

      capturer.edit();
    })
  }

  destroy() {
    ipc.callMain('remove-profile', currentProfile.activeProfileId)
  }
}
