const {setValueAtKeyPath} = require('key-path-helpers')
const {Emitter} = require('event-kit')
const VersionMigrator = require('../../app/version_migrator')

module.exports =
class ConfigFileMock {
  constructor() {
    this.emitter = new Emitter()
  }

  get contents() {
    return this._contents || {}
  }

  set contents(newContents) {
    this._contents = newContents

    this.emitter.emit('did-change', this.contents)

    return this._contents
  }

  update(keyPath, value) {
    const newContents = this.contents
    setValueAtKeyPath(newContents, keyPath, value)

    this.contents = newContents

    return newContents
  }

  get appVersion() {
    return '3000'
  }

  migrateVersions() {
    const currentVersion = this.contents.version || '1.0.5'

    if (currentVersion !== this.appVersion) {
      const migrator = new VersionMigrator(
        this.contents, currentVersion, this.appVersion
      )

      const newContents = migrator.run()
      newContents.version = this.appVersion

      this.contents = newContents
    }
  }

  onDidChange(callback) {
    return this.emitter.on('did-change', contents => {
      return callback(contents)
    })
  }
}
