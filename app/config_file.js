const { Emitter }           = require('event-kit')
const isDev                 = require('electron-is-dev')
const CSON                  = require('season')
const { homedir }           = require('os')
const { join }              = require('path')
const fs                    = require('fs')
const { remote, app }       = require('electron')
const { setValueAtKeyPath } = require('key-path-helpers')
const VersionMigrator       = require('./version_migrator')

module.exports =
class ConfigFile {
  constructor() {
    if (this.fileExists()) {
      this.migrateVersions()
    } else {
      this.contents = { version: this.appVersion }
    }

    this.bindWatcher()
  }

  get filePath() {
    if (isDev) {
      return join(homedir(), '.archipelago.dev.json')
    } else {
      return join(homedir(), '.archipelago.json')
    }
  }

  get appVersion() {
    return ((remote && remote.app) || app).getVersion()
  }

  get emitter() {
    return this._emitter || (this._emitter = new Emitter)
  }

  get contents() {
    return this._contents || this.read()
  }

  set contents(newContents) {
    this._contents = newContents
    CSON.writeFileSync(this.filePath, newContents)

    return this._contents
  }

  read() {
    return this._contents = CSON.readFileSync(this.filePath)
  }

  update(keyPath, value) {
    let newContents = this.contents
    setValueAtKeyPath(newContents, keyPath, value)

    return this.contents = newContents
  }

  fileExists() {
    return CSON.resolve(this.filePath) != null
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

  bindWatcher() {
    let fsWait = false
    return fs.watch(this.filePath, (event, filename) => {
      if (filename && (event === 'change')) {
        if (fsWait) {
          return
        }
        fsWait = setTimeout((() => fsWait = false), 100)
        return this.emitter.emit('did-change', this.read())
      }
    })
  }

  onDidChange(callback) {
    return this.emitter.on('did-change', (contents) => {
      return callback(contents)
    })
  }
}
