module.exports =
class Branch {
  constructor(branch, orientation, left, right) {
    this.branch = branch
    this.orientation = orientation
    this.left = left
    this.right = right
  }

  kill() {
    this.left.kill()
    this.right.kill()
  }
}
