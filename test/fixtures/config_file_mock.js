const { setValueAtKeyPath } = require('key-path-helpers')

module.exports =
class ConfigFileMock {
  get contents() {
    return this._contents || {}
  }

  set contents(newContents) {
    this._contents = newContents

    return this._contents
  }

  update(keyPath, value) {
    let newContents = this.contents
    setValueAtKeyPath(newContents, keyPath, value)

    return this.contents = newContents
  }
}
