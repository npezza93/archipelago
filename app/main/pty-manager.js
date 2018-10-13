import {app} from 'electron'
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
      const pty = new Pty()

      resolve(pty)
    })
  }

  let preppedPty = create()

  global.ptyManager = {
    kill,
    async make() {
      const pty = await preppedPty

      pty.onExit(() => kill(pty.id))
      ptys[pty.id] = pty
      preppedPty = create()

      return pty
    }
  }

  app.on('before-quit', () => Object.keys(ptys).forEach(kill))
}
