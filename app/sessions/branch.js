module.exports =
class Branch {
  constructor(branch, orientation) {
    this.branch = branch
    this.orientation = orientation
  }

  kill() {
    this.left.kill()
    this.right.kill()
  }
}
