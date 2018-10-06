const {api, platform} = require('electron-util')
const {spawn} = require('node-pty')
const {Disposable} = require('event-kit')
const ipc = require('electron-better-ipc')

module.exports =
class Pty {
  constructor() {
    this.id = Math.random()

    this.pty = spawn(
      this.shell,
      ipc.sendSync('get-preferences-sync', 'shellArgs').split(','),
      this.sessionArgs
    )
  }

  get shell() {
    return ipc.sendSync('get-preferences-sync', 'shell') ||
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
