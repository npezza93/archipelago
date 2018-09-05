const {homedir} = require('os')
const {join} = require('path')
const fs = require('fs')
const {remote, app} = require('electron')
const CSON = require('season')
const isDev = require('electron-is-dev')
const {Emitter} = require('event-kit')
const {setValueAtKeyPath} = require('key-path-helpers')
const VersionMigrator = require('./version-migrator')

module.exports =
class ConfigFile {
  constructor() {
    if (this.fileExists()) {
      this.migrateVersions()
    } else {
      this.contents = {version: this.appVersion}
    }

    this.bindWatcher()
  }

  get filePath() {
    if (isDev) {
      return join(homedir(), '.archipelago.dev.json')
    }
    return join(homedir(), '.archipelago.json')
  }

  get appVersion() {
    return ((remote && remote.app) || app).getVersion()
  }

  get emitter() {
    if (this._emitter === undefined) {
      this._emitter = new Emitter()
    }

    return this._emitter
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
    this._contents = CSON.readFileSync(this.filePath)

    return this.contents
  }

  update(keyPath, value) {
    const newContents = this.contents
    setValueAtKeyPath(newContents, keyPath, value)

    this.contents = newContents

    return newContents
  }

  fileExists() {
    return CSON.resolve(this.filePath) !== null
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

  bindWatcher() {
    return fs.watch(this.filePath, (event, filename) => {
      if (filename && (event === 'change')) {
        return this.emitter.emit('did-change', this.read())
      }
    })
  }

  onDidChange(callback) {
    return this.emitter.on('did-change', contents => {
      return callback(contents)
    })
  }
}
