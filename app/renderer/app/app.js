/* global window, document */

import {ipcRenderer as ipc} from 'electron-better-ipc'
import debouncer from 'debounce-fn'
import {Disposable, CompositeDisposable} from 'event-kit'
import Session from './session'
import CurrentProfile from '../utils/current-profile'

const session = new Session();
const currentProfile = new CurrentProfile();
const subscriptions = new CompositeDisposable();

const styleProperties = {
  'theme.background': '--background-color',
  tabBorderColor: '--tab-border-color',
  padding: '--terminal-padding'
}
const resetCssSettings = () => {
  for (const property in styleProperties) {
    document.documentElement.style.setProperty(
      styleProperties[property],
      currentProfile.get(property)
    )
  }
}
const fit = () => debouncer(session.fit, {wait: 50})();

const close = async () => {
  await session.kill()

  window.close()
};
const settingChanged = ({property, value}) => {
  if (property in styleProperties) {
    document.documentElement.style.setProperty(styleProperties[property], value)
  }
};

resetCssSettings();
session.attach(document.querySelector('archipelago-terminal'));
session.fit();
session.xterm.focus();

window.addEventListener('resize', fit);
ipc.on('close-via-menu', close);
subscriptions.add(new Disposable(() => ipc.removeListener('close-via-menu', close)));
subscriptions.add(new Disposable(ipc.answerMain('setting-changed', settingChanged)));
subscriptions.add(new Disposable(ipc.answerMain('active-profile-changed', resetCssSettings)));
subscriptions.add(new Disposable(ipc.answerMain('close', close)));
subscriptions.add(session.onExit(close));

window.addEventListener('beforeunload', () => {
  subscriptions.dispose();
  session.kill();
  window.removeEventListener('resize', fit);
});