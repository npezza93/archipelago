const {BrowserWindow} = require('electron')
const {api} = require('electron-util')
const ipc = require('electron-better-ipc')

const {pref} = require('../configuration/config-file')
const Pty = require('../sessions/pty')

module.exports = () => {
  const sessions = {}

  const kill = id => {
    sessions[id].kill()
    delete sessions[id]
  }

  const create = () => {
    const newPty = new Pty(pref())
    newPty.onExit(() => {
      for (const window of BrowserWindow.getAllWindows()) {
        ipc.callRenderer(window, `exit-${newPty.id}`)
      }
      kill(newPty.id)
    })

    sessions[newPty.id] = newPty

    return newPty.id
  }

  ipc.answerRenderer('create-pty', create)
  ipc.answerRenderer('kill-pty', kill)
  api.app.on('quit', () => Object.keys(sessions).forEach(id => kill(id)))
}
