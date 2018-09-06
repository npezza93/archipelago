const ElectronStore = require('electron-store')
const {Emitter} = require('event-kit')

const pkg = require('../package.json')
const VersionMigrator = require('./version-migrator')

module.exports =
class ConfigFile extends ElectronStore {
  constructor() {
    const opts = {defaults: {version: pkg.version}}

    super(opts)

    this.events = new Emitter()
  }

  migrateVersions() {
    const currentVersion = this.store.version || '1.0.5'

    if (currentVersion !== pkg.version) {
      const migrator = new VersionMigrator(
        this.store, currentVersion, pkg.version
      )

      const newContents = migrator.run()

      newContents.version = pkg.version

      this.store = newContents
    }
  }
}
