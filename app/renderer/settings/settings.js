/* global window, document */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import {Application} from '@hotwired/stimulus';

import CurrentProfile from '../utils/current-profile';

import DragHeaderController from './controllers/drag-header-controller';
import TabsController from './controllers/tabs-controller';
import FontsController from './controllers/fonts-controller';
import RadioController from './controllers/radio-controller';
import CheckboxController from './controllers/checkbox-controller';
import SelectController from './controllers/select-controller';
import TextController from './controllers/text-controller';
import ColorController from './controllers/color-controller';
import OpacityController from './controllers/opacity-controller';
import KeybindingsController from './controllers/keybindings-controller';
import KeybindingController from './controllers/keybinding-controller';
import KeybindingCapturerController from './controllers/keybinding-capturer-controller';
import KeybindingActionsController from './controllers/keybinding-actions-controller';

import ProfilesController from './controllers/profiles-controller';
import ProfileController from './controllers/profile-controller';
import ProfileCapturerController from './controllers/profile-capturer-controller';
import ProfileActionsController from './controllers/profile-actions-controller';

require('electron').ipcRenderer.setMaxListeners(50);

window.currentProfile = new CurrentProfile();
const app = Application.start();

app.register('drag-header', DragHeaderController);
app.register('tabs', TabsController);
app.register('fonts', FontsController);
app.register('radio', RadioController);
app.register('checkbox', CheckboxController);
app.register('select', SelectController);
app.register('text', TextController);
app.register('color', ColorController);
app.register('opacity', OpacityController);
app.register('keybindings', KeybindingsController);
app.register('keybinding', KeybindingController);
app.register('keybinding-capturer', KeybindingCapturerController);
app.register('keybinding-actions', KeybindingActionsController);
app.register('profiles', ProfilesController);
app.register('profile', ProfileController);
app.register('profile-capturer', ProfileCapturerController);
app.register('profile-actions', ProfileActionsController);

ipc.answerMain('close-via-menu', window.close);

window.addEventListener('blur', () => document.body.dataset.focus = 'false');
window.addEventListener('focus', () => document.body.dataset.focus = 'true');
