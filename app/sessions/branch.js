const Session = require('./session')

module.exports =
class Branch {
  constructor(branch, orientation, left, pref) {
    this.branch = branch
    this.orientation = orientation
    this.left = left
    this.right = new Session(pref, this)
  }

  kill() {
    this.left.kill()
    this.right.kill()
  }
}
