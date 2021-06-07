import Session from './session'

export default class Tab {
  constructor(type) {
    this.root = new Session(type)
    this.id = Math.random()
    this.title = ''
    this.isUnread = false
    this.type = type
  }

  async kill() {
    if (this.root) {
      await this.root.kill()
      this.root = null
    }
  }

  find(branch, sessionId) {
    let foundSession = null

    this.traverse(branch, session => {
      if (session.id === sessionId) {
        foundSession = session
      }
    })

    return foundSession
  }

  traverse(branch, callback) {
    if (branch === null || branch === undefined) {
      return
    }

    if (branch.className === 'Session') {
      callback(branch)
    }

    this.traverse(branch.left, callback)
    this.traverse(branch.right, callback)
  }

  sessionToSave(sessionToRemove) {
    let sessionToSave

    if (sessionToRemove && sessionToRemove.branch) {
      if (sessionToRemove.branch.left === sessionToRemove) {
        sessionToSave = sessionToRemove.branch.right
      } else if (sessionToRemove.branch.right === sessionToRemove) {
        sessionToSave = sessionToRemove.branch.left
      }
    }

    return sessionToSave
  }
}
