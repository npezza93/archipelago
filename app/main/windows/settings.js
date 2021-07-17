import {darkMode} from 'electron-util';
import {ipcMain as ipc} from 'electron-better-ipc';
import {makeWindow} from '../utils';

let settingsWindow = null;
const windowOptions = {
  backgroundColor: darkMode.isEnabled ? '#393736' : '#F5F5F5',
  webPreferences: {
    experimentalFeatures: true,
    enableRemoteModule: true,
    nodeIntegration: true,
    contextIsolation: false,
  },
};
ipc.answerRenderer('resize', ({width, height}) => {
  if (settingsWindow) {
    settingsWindow.setSize(width, height, true);
  }
});

export default {
  toggle() {
    if (settingsWindow === null || settingsWindow.isDestroyed()) {
      settingsWindow = makeWindow('settings', windowOptions);
      settingsWindow.setResizable(false);
      settingsWindow.setMaximizable(false);
      settingsWindow.setMinimizable(false);
      settingsWindow.setFullScreenable(false);
      settingsWindow.title = 'Settings';
    } else {
      settingsWindow.focus();
    }
  },
};
