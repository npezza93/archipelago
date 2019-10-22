import {BrowserWindow} from 'electron'
import {api} from 'electron-util'
import {ipcMain as ipc} from 'electron-better-ipc'
import {spawn} from 'node-pty'
import {Disposable} from 'event-kit'
import debouncer from 'debounce-fn'
import defaultShell from 'default-shell'

export default class Pty {
  constructor(profileManager) {
    this.id = Math.random()
    this.profileManager = profileManager
    this.bufferedData = ''
    this.bufferTimeout = null

    this.pty = spawn(
      this.shell,
      this.profileManager.get('shellArgs').split(','),
      this.sessionArgs
    )
  }

  get shell() {
    return this.profileManager.get('shell') || defaultShell
  }

  get sessionArgs() {
    return {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: {
        LANG: (api.app.getLocale() || '') + '.UTF-8',
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        ...process.env
      }
    }
  }

  async kill() {
    await new Promise(resolve => {
      this.pty.removeAllListeners('data')
      this.pty.removeAllListeners('exit')
      ipc.removeListener(`pty-resize-${this.sessionId}`, this.handleResize)
      ipc.removeListener(`pty-write-${this.sessionId}`, this.handleWrite)
      this.pty.destroy()
      resolve()
    })
  }

  created(sessionId, sessionWindowId) {
    this.sessionId = sessionId
    this.sessionWindow = BrowserWindow.getAllWindows().find(browserWindow => {
      return browserWindow.id === sessionWindowId
    })
    ipc.on(`pty-resize-${this.sessionId}`, this.handleResize.bind(this))
    ipc.on(`pty-write-${this.sessionId}`, this.handleWrite.bind(this))
    this.pty.onExit(() => {
      this.sessionWindow.webContents.send(`pty-exit-${this.sessionId}`)
    })
    this.pty.onData(data => this.bufferData(data))
  }

  onExit(callback) {
    this.pty.onExit(callback)

    return new Disposable(() => this.pty.removeListener('exit', callback))
  }

  onData(callback) {
    this.pty.onData(callback)

    return new Disposable(() => this.pty.removeListener('data', callback))
  }

  resize(cols, rows) {
    if (Number.isInteger(cols) && Number.isInteger(rows)) {
      try {
        this.pty.resize(cols, rows)
      } catch (error) {}
    }
  }

  write(data) {
    this.pty.write(data)
  }

  handleWrite(event, data) {
    this.write(data)
  }

  handleResize(event, {cols, rows}) {
    this.resize(cols, rows)
  }

  bufferData(data) {
    this.bufferedData += data
    if (!this.bufferTimeout) {
      this.bufferTimeout = debouncer(() => {
        this.sessionWindow.webContents.send(`pty-data-${this.sessionId}`, this.bufferedData)
        this.bufferedData = ''
        this.bufferTimeout = null
      }, {wait: 10})()
    }
  }
}
