import {app} from 'electron'
import {ipcMain as ipc} from 'electron-better-ipc'
import Pty from './pty'

export default profileManager => {
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
      ipc.once(`pty-kill-${pty.id}`, () => kill(pty.id))

      resolve(pty)
    })
  }

  const disposeOfCreate = ipc.answerRenderer('pty-create', async ({sessionId, sessionWindowId}) => {
    const pty = await create()
    ptys[pty.id] = pty
    pty.created(sessionId, sessionWindowId)

    return pty.id
  })

  app.on('before-quit', () => {
    disposeOfCreate()
    Object.keys(ptys).forEach(kill)
  })
}
