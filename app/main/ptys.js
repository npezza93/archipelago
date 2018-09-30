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
    return new Promise(resolve => {
      const newPty = new Pty(pref())
      newPty.onExit(() => {
        for (const window of BrowserWindow.getAllWindows()) {
          ipc.callRenderer(window, `exit-${newPty.id}`)
        }
        kill(newPty.id)
      })

      resolve(newPty)
    })
  }
  let preppedPty = create()

  ipc.answerRenderer('create-pty', async () => {
    const pty = await preppedPty
    sessions[pty.id] = pty
    preppedPty = create()
    return pty.id
  })
  ipc.answerRenderer('kill-pty', kill)
  api.app.on('quit', () => Object.keys(sessions).forEach(id => kill(id)))
}
