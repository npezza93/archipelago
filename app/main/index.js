import {app, Menu} from 'electron';
import {CompositeDisposable, Disposable} from 'event-kit';
import contextMenu from 'electron-context-menu';
import {pref} from './config-file';
import ProfileManager from './profile-manager';
import template from './app-menu';
import ptyManager from './pty-manager';
import {argbBackground, makeWindow} from './utils';
import {initialize} from '@electron/remote/main';

initialize()

if (app.isPackaged) {
  require('update-electron-app')();
}

const windows = [];
const subscriptions = new CompositeDisposable();
const profileManager = new ProfileManager(pref());
profileManager.validate();
subscriptions.add(new Disposable(() => profileManager.dispose()));
ptyManager(profileManager);

app.commandLine.appendSwitch('enable-features=\'FontAccess\'');
// app.commandLine.appendSwitch('enable-features', 'Metal')

const resetAppMenu = () =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(template(createWindow, profileManager)),
  );

const createWindow = () => {
  const win = makeWindow(process.env.PAGE || 'app', {
    width: 1000,
    backgroundColor: argbBackground(profileManager, 'theme.background'),
    vibrancy: profileManager.get('vibrancy'),
  });
  if (!profileManager.get('hideContextMenu')) {
    contextMenu({
      window: win,
      shouldShowMenu: (event, parameters) => parameters.isEditable,
    });
  }

  windows.push(win);
};

app.on('ready', () => {
  createWindow();
  resetAppMenu();
  app.dock.setMenu(Menu.buildFromTemplate([
    {label: 'New Window', click: createWindow},
  ]));
});

app.on('quit', () => subscriptions.dispose());

app.on('before-quit', () => {
  windows.forEach(win => {
    win.removeAllListeners('close');
  });
});

app.on('window-all-closed', () => {});

app.on('activate', () => {
  const activeWindow = windows.find(win => !win.isDestroyed());

  if (!activeWindow) {
    createWindow();
  }
});

subscriptions.add(profileManager.onDidChange('vibrancy', value =>
  windows.forEach(win => {
    if (!win.isDestroyed()) {
      win.setVibrancy(value);
    }
  }),
));

subscriptions.add(profileManager.onDidChange('name', resetAppMenu));
subscriptions.add(profileManager.onActiveProfileChange(resetAppMenu));
