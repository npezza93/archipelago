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
    return (async () => {
      await this.left.kill()
      await this.right.kill()
    })()
  }
}
