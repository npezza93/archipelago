/* global window */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import {api, darkMode} from 'electron-util';
import {Disposable, CompositeDisposable} from 'event-kit';

const subscriptions = new CompositeDisposable();
const setDarkMode = () => {
  if (darkMode.isEnabled) {
    document.querySelector("body").dataset.theme = "dark";
  } else {
    document.querySelector("body").dataset.theme = "light";
  }
}

document.querySelector("#version").textContent = `v${api.app.getVersion()}`;
setDarkMode();

ipc.on('dark-mode-changed', setDarkMode)
subscriptions.add(new Disposable(() => ipc.removeListener('close-via-menu', window.close)));
subscriptions.add(new Disposable(ipc.answerMain('close', window.close)));
subscriptions.add(new Disposable(() => ipc.removeListener('dark-mode-changed', setDarkMode)))

window.addEventListener('beforeunload', subscriptions.dispose);
