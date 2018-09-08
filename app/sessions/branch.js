const {createElement} = require('react')
const SplitPane = require('react-split-pane')

module.exports =
class Branch {
  constructor(branch, orientation) {
    this.branch = branch
    this.orientation = orientation
  }

  render(props) {
    return createElement(
      SplitPane, {
        split: this.orientation,
        defaultSize: '50%'
      },
      this.left.render(props),
      this.right.render(props)
    )
  }

  get isSession() {
    return false
  }

  kill() {
    this.left.kill()
    this.right.kill()
  }
}
