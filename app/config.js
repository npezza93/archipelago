const isDev           = require('electron-is-dev')
const CSON            = require('season')
const fs              = require('fs')
const { homedir }     = require('os')
const { join }        = require('path')
const { Emitter }     = require('event-kit')
const { remote, app } = require('electron')
const { getValueAtKeyPath, setValueAtKeyPath, pushKeyPath } =
  require('key-path-helpers')

const Schema          = require('./schema')
const Coercer         = require('./coercer')
const VersionMigrator = require('./version_migrator')

module.exports =
class Config {
  constructor() {
    if (isDev) {
      this.filePath = join(homedir(), '.archipelago.dev.json')
    } else {
      this.filePath = join(homedir(), '.archipelago.json')
    }
    this.schema = new Schema
    this.emitter  = new Emitter

    if (CSON.resolve(this.filePath) != null) {
      this._checkConfigVersion(CSON.readFileSync(this.filePath) || {})
      this._refreshConfig(null, CSON.readFileSync(this.filePath) || {})
    } else {
      this._refreshConfig(null, {version: this.currentVersion()})
      this._writeSync(this.contents)
    }

    this._bindWatcher()
  }

  get(keyPath, options) {
    const schema = this.schema.getSchema(keyPath)
    if (schema == null) { return }

    let profileKeyPath = `profiles.${this.activeProfileId}.${keyPath}`
    if (schema.platformSpecific != null) {
      profileKeyPath = pushKeyPath(profileKeyPath, process.platform)
    }

    const currentValue = getValueAtKeyPath(this.contents, profileKeyPath)
    const defaultValue = this.schema.defaultValue(keyPath)

    const coercer = new Coercer(keyPath, currentValue, defaultValue, schema, options)
    return coercer.coerce()
  }

  set(keyPath, value) {
    const schema = this.schema.getSchema(keyPath)
    if (schema == null) { return }
    keyPath = `profiles.${this.activeProfileId}.${keyPath}`
    if (schema.platformSpecific != null) {
      keyPath = pushKeyPath(keyPath, process.platform)
    }

    setValueAtKeyPath(this.contents, keyPath, value)
    return this._write(this.contents)
  }

  onDidChange(keyPath, callback, options) {
    let oldValue = this.get(keyPath)
    return this.emitter.on('did-change', () => {
      const newValue = this.get(keyPath, options)
      if (oldValue !== newValue) {
        oldValue = newValue
        return callback(newValue)
      }
    })
  }

  onActiveProfileChange(callback) {
    let oldValue = this.activeProfileId
    return this.emitter.on('did-change', () => {
      const newValue = this.activeProfileId
      if (oldValue !== newValue) {
        oldValue = newValue
        return callback(newValue)
      }
    })
  }

  on(event, callback) {
    return this.emitter.on(event, callback)
  }

  setActiveProfileId(id) {
    this.contents.activeProfileId = parseInt(id)

    return this._write(this.contents)
  }

  setProfileName(id, newName) {
    this.contents.profiles[id].name = newName

    return this._write(this.contents)
  }

  getProfileName(id) {
    const schema = this.schema.getSchema('name')
    const defaultValue = this.schema.defaultValue('name')
    const currentValue = getValueAtKeyPath(this.contents, `profiles.${id}.name`)

    return (new Coercer('name', currentValue, defaultValue, schema)).coerce()
  }

  createProfile() {
    const id = Math.max(...this.profileIds) + 1
    this.contents.profiles[id] = { id }
    this.contents.activeProfileId = id

    this._write(this.contents)

    return id
  }

  destroyProfile(id) {
    delete this.contents.profiles[id]

    return this._write(this.contents)
  }

  validateActiveProfile() {
    if ((this.activeProfileId != null) && (this.activeProfile != null)) { return }

    if (Object.keys(this.profiles)[0] != null) {
      return this.setActiveProfileId(Object.keys(this.profiles)[0])
    } else {
      return this._write({activeProfileId: 1, profiles: { 1: { id: 1 } }})
    }
  }

  settingScopes() {
    return this.schema.settingScopes()
  }

  fieldsInSettingScope(scope) {
    return this.schema.bySettingScope()[scope]
  }

  currentVersion() {
    return ((remote && remote.app) || app).getVersion()
  }

  _refreshConfig(error, newContents) {
    if ((error != null) || (newContents == null)) { return }

    this.profiles = newContents.profiles || {}
    this.profileIds = Object.keys(this.profiles)
    this.activeProfileId = newContents.activeProfileId
    this.activeProfile = this.profiles[this.activeProfileId]
    this.contents = newContents

    this.validateActiveProfile()
    return this.emitter.emit('did-change')
  }

  _bindWatcher() {
    let fsWait = false
    return fs.watch(this.filePath, (event, filename) => {
      if (filename && (event === 'change')) {
        if (fsWait) {
          return
        }
        fsWait = setTimeout((() => fsWait = false), 100)
        return CSON.readFile(this.filePath, this._refreshConfig.bind(this))
      }
    })
  }

  _write(contents) {
    return CSON.writeFile(this.filePath, contents)
  }

  _writeSync(contents) {
    return CSON.writeFileSync(this.filePath, contents)
  }

  _checkConfigVersion(contents) {
    this.contents = contents
    const differentVersion =
      (contents.version != null) && (contents.version !== this.currentVersion())

    if (differentVersion || (contents.version == null)) {
      const migrator = new VersionMigrator(
        this, contents.version || '1.0.5', this.currentVersion()
      )
      return migrator.run()
    }
  }
}
