const ipc = require('electron-better-ipc')

/* eslint-disable import/no-unresolved */
const {pref} = require('common/config-file')
const Session = require('common/session')
/* eslint-enable import/no-unresolved */

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
