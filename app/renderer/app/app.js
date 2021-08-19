/* global window, document */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import { debounce } from 'throttle-debounce';
import {Disposable, CompositeDisposable} from 'event-kit';
import CurrentProfile from '../utils/current-profile';
import Session from './session';

const session = new Session();
const currentProfile = new CurrentProfile();
const subscriptions = new CompositeDisposable();

const styleProperties = {
  'theme.background': '--background-color',
  tabBorderColor: '--tab-border-color',
  padding: '--terminal-padding',
};
const resetCssSettings = () => {
  for (const property in styleProperties) {
    document.documentElement.style.setProperty(
      styleProperties[property],
      currentProfile.get(property),
    );
  }
};

const fit = () => debounce(50, session.fit.bind(session))();

const close = async () => {
  await session.kill();

  window.close();
};

const settingChanged = ({property, value}) => {
  if (property in styleProperties) {
    document.documentElement.style.setProperty(styleProperties[property], value);
  }
};

resetCssSettings();

ipc.answerMain('showing', () => {
  session.attach(document.querySelector('archipelago-terminal'));
});

window.addEventListener('resize', fit);
ipc.on('close-via-menu', close);
subscriptions.add(new Disposable(() => ipc.removeListener('close-via-menu', close)));
subscriptions.add(new Disposable(ipc.answerMain('setting-changed', settingChanged)));
subscriptions.add(new Disposable(ipc.answerMain('active-profile-changed', resetCssSettings)));
subscriptions.add(session.onExit(close));

window.addEventListener('beforeunload', () => {
  subscriptions.dispose();
  session.kill();
  window.removeEventListener('resize', fit);
});
