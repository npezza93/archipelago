import Session from './session'

export default class Branch {
  constructor(branch, orientation, left, type) {
    this.branch = branch
    this.orientation = orientation
    this.left = left
    this.right = new Session(type, this)
  }

  async kill() {
    await this.left.kill()
    await this.right.kill()
  }

  get type() {
    return 'branch'
  }
}
