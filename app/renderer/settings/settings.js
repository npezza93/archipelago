/* global window */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import {api} from 'electron-util';
import { Application } from 'stimulus';

import CurrentProfile from '../utils/current-profile'

import TabsController from './controllers/tabs_controller';
import FontsController from './controllers/fonts_controller';
import RadioController from './controllers/radio_controller';
import CheckboxController from './controllers/checkbox_controller';
import SelectController from './controllers/select_controller';
import TextController from './controllers/text_controller';
import ColorController from './controllers/color_controller';
import OpacityController from './controllers/opacity_controller';

window.currentProfile = new CurrentProfile()
const application = Application.start()

application.register('tabs', TabsController)
application.register('fonts', FontsController)
application.register('radio', RadioController)
application.register('checkbox', CheckboxController)
application.register('select', SelectController)
application.register('text', TextController)
application.register('color', ColorController)
application.register('opacity', OpacityController)

ipc.on('close-via-menu', window.close);
ipc.answerMain('close', window.close);

window.addEventListener('blur', () => document.body.dataset.focus = 'false');
window.addEventListener('focus', () => document.body.dataset.focus = 'true');