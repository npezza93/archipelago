import {BrowserWindow} from 'electron';
import {ipcMain as ipc} from 'electron-better-ipc';
import {spawn} from '@npezza93/node-pty';
import {Disposable} from 'event-kit';
import debounce from '../common/debounce';

export default class Pty {
  constructor(profileManager) {
    this.id = Math.random();
    this.profileManager = profileManager;
    this.bufferedData = '';
    this.bufferTimeout = null;

    this.pty = spawn(
      this.shell,
      this.profileManager.get('shellArgs').split(',').filter(arg => Boolean(arg)),
      this.sessionArgs,
    );
  }

  get shell() {
    return this.profileManager.get('shell') || process.env.SHELL || '/bin/bash';
  }

  get sessionArgs() {
    return {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: {TERM: 'xterm-256color', COLORTERM: 'truecolor', ...process.env},
    };
  }

  async kill() {
    await new Promise(resolve => {
      this.pty.removeAllListeners('data');
      this.pty.removeAllListeners('exit');
      ipc.removeListener(`pty-resize-${this.sessionId}`, this.handleResize);
      ipc.removeListener(`pty-write-${this.sessionId}`, this.handleWrite);
      this.pty.destroy();
      resolve();
    });
  }

  created(sessionId, sessionWindowId) {
    this.sessionId = sessionId;
    this.sessionWindow = BrowserWindow.getAllWindows().find(browserWindow => browserWindow.id === sessionWindowId);
    ipc.on(`pty-resize-${this.sessionId}`, this.handleResize.bind(this));
    ipc.on(`pty-write-${this.sessionId}`, this.handleWrite.bind(this));
    this.pty.onExit(() => {
      this.sessionWindow.webContents.send(`pty-exit-${this.sessionId}`);
    });
    this.pty.onData(data => this.bufferData(data));
  }

  onExit(callback) {
    this.pty.onExit(callback);

    return new Disposable(() => this.pty.removeListener('exit', callback));
  }

  onData(callback) {
    this.pty.onData(callback);

    return new Disposable(() => this.pty.removeListener('data', callback));
  }

  resize(cols, rows) {
    if (Number.isInteger(cols) && Number.isInteger(rows) && !this.pty._emittedClose) {
      try {
        this.pty.resize(cols, rows);
      } catch (error) {
        console.log(error);
      }
    }
  }

  write(data) {
    this.pty.write(data);
  }

  handleWrite(event, data) {
    this.write(data);
  }

  handleResize(event, {cols, rows}) {
    this.resize(cols, rows);
  }

  bufferData(data) {
    this.bufferedData += data;
    if (!this.bufferTimeout) {
      this.bufferTimeout = debounce(() => {
        this.sessionWindow.webContents.send(`pty-data-${this.sessionId}`, this.bufferedData);
        this.bufferedData = '';
        this.bufferTimeout = null;
      }, 2)();
    }
  }
}
