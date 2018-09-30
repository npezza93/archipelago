const Session = require('./session')

module.exports =
class Branch {
  constructor(branch, orientation, left, pref, type) {
    this.branch = branch
    this.orientation = orientation
    this.left = left
    this.right = new Session(pref, type, this)
  }

  async kill() {
    await this.left.kill()
    await this.right.kill()
  }
}
