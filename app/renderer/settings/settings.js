/* global window */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import {api} from 'electron-util';
import { Application } from 'stimulus';

import TabsController from './controllers/tabs_controller';
import FontsController from './controllers/fonts_controller';

const application = Application.start()

application.register('tabs', TabsController)
application.register('fonts', FontsController)

ipc.on('close-via-menu', window.close);
ipc.answerMain('close', window.close);

window.addEventListener('blur', () => document.body.dataset.focus = 'false');
window.addEventListener('focus', () => document.body.dataset.focus = 'true');
