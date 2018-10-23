/* global profileManager */

import {app} from 'electron'
import ipc from 'electron-better-ipc'
import Pty from './pty'

export default () => {
  const ptys = {}

  ipc.answerRenderer('pty-kill', id => kill(id))

  const kill = id => {
    if (ptys[id]) {
      ptys[id].kill()
      delete ptys[id]
    }
  }

  const create = () => {
    return new Promise(resolve => {
      const pty = new Pty(profileManager)
      pty.onExit(() => kill(pty.id))

      resolve(pty)
    })
  }

  let preppedPty = create()

  global.ptyManager = {
    async make(sessionId, sessionWindow) {
      const pty = await preppedPty

      ptys[pty.id] = pty
      pty.sessionId = sessionId
      pty.sessionWindow = sessionWindow
      preppedPty = create()

      return pty
    }
  }

  app.on('before-quit', () => Object.keys(ptys).forEach(kill))
}
