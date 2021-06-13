/* global window */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import {api} from 'electron-util';

document.querySelector("#version").textContent = `v${api.app.getVersion()}`;

ipc.on('close-via-menu', window.close);
ipc.answerMain('close', window.close);
