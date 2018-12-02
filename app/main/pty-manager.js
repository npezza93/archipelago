/* global profileManager */

import {app} from 'electron'
import ipc from 'electron-better-ipc'
import Pty from './pty'

export default () => {
  const ptys = {}

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
      ipc.answerRenderer(`pty-kill-${pty.id}`, () => kill(pty.id))

      resolve(pty)
    })
  }

  let preppedPty = create()

  ipc.answerRenderer('pty-create', async ({sessionId, sessionWindowId}) => {
    const pty = await preppedPty
    ptys[pty.id] = pty
    pty.created(sessionId, sessionWindowId)
    preppedPty = create()

    return pty.id
  })

  app.on('before-quit', () => Object.keys(ptys).forEach(kill))
}
