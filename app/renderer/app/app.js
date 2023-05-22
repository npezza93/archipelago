/* global window, document */

import {ipcRenderer as ipc} from 'electron-better-ipc';
import mouseConstructor from 'osx-mouse';
import {getCurrentWindow} from '@electron/remote';
import debounce from '../../common/debounce';
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

const fit = () => debounce(session.fit.bind(session), 50)();

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
  const mouse = mouseConstructor();
  let offset = null;
  let dragging = false;

  document.addEventListener('mousedown', (e) => {
    if (dragging || (!dragging && e.clientY <= 35)) {
      dragging = true;
      offset = [e.clientX, e.clientY];
    }
  })

  mouse.on('left-drag', (x, y) => {
    if (!offset) return

    x = Math.round(x - offset[0])
    y = Math.round(y - offset[1])

    getCurrentWindow().setPosition(x + 0, y + 0)
  })

  mouse.on('left-up', () => {
    offset = null;
    dragging = false;
  });
});

window.addEventListener('resize', fit);
subscriptions.add(new Disposable(ipc.answerMain('close-via-menu', close)));
subscriptions.add(new Disposable(ipc.answerMain('setting-changed', settingChanged)));
subscriptions.add(new Disposable(ipc.answerMain('active-profile-changed', resetCssSettings)));
subscriptions.add(session.onExit(close));

window.addEventListener('beforeunload', () => {
  subscriptions.dispose();
  session.kill();
  mouse.destroy();
  window.removeEventListener('resize', fit);
});
