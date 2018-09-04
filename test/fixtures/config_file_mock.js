const { setValueAtKeyPath } = require('key-path-helpers')
const VersionMigrator = require('../../app/version_migrator')

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

  get appVersion() {
    return '3000'
  }

  migrateVersions() {
    const currentVersion = this.contents.version || '1.0.5'

    if (currentVersion !== this.appVersion) {
      const migrator = new VersionMigrator(
        this.contents, currentVersion, this.appVersion
      )

      let newContents = migrator.run()
      newContents.version = this.appVersion

      this.contents = newContents
    }
  }
}
