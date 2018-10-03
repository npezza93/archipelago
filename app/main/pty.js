const {
  BrowserWindow,
} = require('electron');
const {
  api,
  platform,
} = require('electron-util');
const ipc = require('electron-better-ipc');
const {
  spawn,
} = require('node-pty');

const ProfileManager = require('../configuration/profile-manager');

module.exports = class Pty {
  constructor(pref) {
    this.id = Math.random();
    this.profileManager = new ProfileManager(pref);
    this.pref = pref;

    this.pty = spawn(
      this.shell,
      this.profileManager.get('shellArgs').split(','),
      this.sessionArgs,
    );

    this.bindDataListeners();
  }

  get shell() {
    return this.profileManager.get('shell')
      || process.env[platform({
        windows: 'COMSPEC',
        default: 'SHELL',
      })];
  }

  get sessionArgs() {
    return {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: {
        LANG: `${api.app.getLocale() || ''}.UTF-8`,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        ...process.env,
      },
    };
  }

  kill() {
    this.pty.removeAllListeners('data');
    this.pty.removeAllListeners('exit');
    this.pty.kill();
    this.pref.events.dispose();
  }

  onExit(callback) {
    this.pty.on('exit', callback);
  }

  onData(callback) {
    this.pty.on('data', callback);
  }

  bindDataListeners() {
    ipc.answerRenderer(`resize-${this.id}`, ({
      cols,
      rows,
    }) => this.pty.resize(cols, rows));
    ipc.answerRenderer(`write-${this.id}`, data => this.pty.write(data));

    this.onExit(() => {
      for (const window of BrowserWindow.getAllWindows()) {
        ipc.callRenderer(window, `exit-${this.id}`);
      }
    });

    this.onData((data) => {
      for (const window of BrowserWindow.getAllWindows()) {
        ipc.callRenderer(window, `write-${this.id}`, data);
      }
    });
  }
};
