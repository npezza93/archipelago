/* global window */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import {api, darkMode} from 'electron-util';
import { Application } from 'stimulus';

import TabsController from './controllers/tabs_controller';
import FontsController from './controllers/fonts_controller';

const application = Application.start()

application.register('tabs', TabsController)
application.register('fonts', FontsController)

const setDarkMode = () => {
  if (darkMode.isEnabled) {
    document.body.dataset.theme = 'dark';
  } else {
    document.body.dataset.theme = 'light';
  }
}

setDarkMode();

ipc.on('dark-mode-changed', setDarkMode)
ipc.removeListener('close-via-menu', window.close);
ipc.answerMain('close', window.close);

window.addEventListener('blur', () => document.body.dataset.focus = 'false');
window.addEventListener('focus', () => document.body.dataset.focus = 'true');
