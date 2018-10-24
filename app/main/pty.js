import {BrowserWindow} from 'electron'
import {api, platform} from 'electron-util'
import ipc from 'electron-better-ipc'
import {spawn} from 'node-pty'
import {Disposable} from 'event-kit'

export default class Pty {
  constructor(profileManager) {
    this.id = Math.random()
    this.profileManager = profileManager

    this.pty = spawn(
      this.shell,
      this.profileManager.get('shellArgs').split(','),
      this.sessionArgs
    )
  }

  get shell() {
    return this.profileManager.get('shell') ||
      process.env[platform({windows: 'COMSPEC', default: 'SHELL'})]
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
      this.pty.kill()
      resolve()
    })
  }

  created(sessionId, sessionWindowId) {
    this.sessionId = sessionId
    this.sessionWindow = BrowserWindow.getAllWindows().find(browserWindow => {
      return browserWindow.id === sessionWindowId
    })
    ipc.answerRenderer(`pty-resize-${this.sessionId}`, ({cols, rows}) => {
      this.resize(cols, rows)
    })
    ipc.answerRenderer(`pty-write-${this.sessionId}`, data => this.write(data))
    this.pty.on('exit', () => {
      ipc.callRenderer(this.sessionWindow, `pty-exit-${this.sessionId}`)
    })
    this.pty.on('data', data => {
      ipc.callRenderer(this.sessionWindow, `pty-data-${this.sessionId}`, data)
    })
  }

  onExit(callback) {
    this.pty.on('exit', callback)

    return new Disposable(() => this.pty.removeListener('exit', callback))
  }

  onData(callback) {
    this.pty.on('data', callback)

    return new Disposable(() => this.pty.removeListener('data', callback))
  }

  resize(cols, rows) {
    this.pty.resize(cols, rows)
  }

  write(data) {
    this.pty.write(data)
  }
}
