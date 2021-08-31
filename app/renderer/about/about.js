/* global window, document */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import {app} from '@electron/remote';

document.querySelector('#version').textContent = `v${app.getVersion()}`;

ipc.on('close-via-menu', window.close);
