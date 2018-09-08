const Branch = require('./branch')
const Session = require('./session')

module.exports =
class Tab {
  constructor() {
    this.root = new Session()
    this.id = Math.random()
    this.title = ''
    this.isUnread = false
  }

  render(props) {
    return this.root.render(props)
  }

  add(sessionId, orientation) {
    if (this.root.constructor.name === 'Session') {
      const session = this.root
      const branch = this.newBranch(session, orientation)
      this.root = branch
      return this.root
    }

    return this.newBranch(this.find(this.root, sessionId), orientation)
  }

  remove(sessionId) {
    if (this.root.constructor.name === 'Session' && (this.root.id === sessionId)) {
      this.root = null
      return
    }

    let sessionToSave
    const sessionToRemove = this.find(this.root, sessionId)

    if (!sessionToRemove) {
      return
    }

    sessionToRemove.kill()

    if (sessionToRemove.branch && (sessionToRemove.branch.left === sessionToRemove)) {
      sessionToSave = sessionToRemove.branch.right
    } else if (sessionToRemove.branch &&
        (sessionToRemove.branch.right === sessionToRemove)) {
      sessionToSave = sessionToRemove.branch.left
    }

    if (sessionToSave.branch === this.root) {
      this.root = sessionToSave
      return this.root
    }
    if (sessionToSave.branch.branch.left === sessionToSave.branch) {
      sessionToSave.branch.branch.left = sessionToSave
    }
    if (sessionToSave.branch.branch.right === sessionToSave.branch) {
      sessionToSave.branch.branch.right = sessionToSave
    }
    sessionToSave.branch = sessionToSave.branch.branch
    return sessionToSave.branch
  }

  kill() {
    if (this.root) {
      this.root.kill()
    }
  }

  focusableSession() {
    let session = this.root
    while (!session.constructor.name === 'Session') {
      session = session.left
    }

    return session
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

    if (branch.constructor.name === 'Session') {
      callback(branch)
    }

    this.traverse(branch.left, callback)
    this.traverse(branch.right, callback)
  }

  newBranch(session, orientation) {
    const branch = new Branch(session.branch, orientation)
    branch.left = session
    branch.right = new Session(branch)

    if (session.branch && session.branch.left.id === session.id) {
      session.branch.left = branch
    } else if (session.branch && session.branch.right.id === session.id) {
      session.branch.right = branch
    }

    session.branch = branch

    return branch
  }
}
