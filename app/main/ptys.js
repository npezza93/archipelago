const ipc = require('electron-better-ipc')

const {pref} = require('../common/config-file')
const Session = require('../common/session')

module.exports = () => {
  const create = () => {
    return new Promise(resolve => {
      const session = new Session(pref())

      resolve(session)
    })
  }

  let preppedSession = create()

  ipc.answerRenderer('create-session', async (branch, type) => {
    const session = await preppedSession
    session.branch = branch

    preppedSession = create()

    return session
  })
}
