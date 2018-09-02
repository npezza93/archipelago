const { Emitter } = require('event-kit')
const { getValueAtKeyPath, pushKeyPath } = require('key-path-helpers')

const Schema     = require('./schema')
const Coercer    = require('./coercer')
const ConfigFile = require('./config_file')

module.exports =
class Config {
  constructor() {
    this._refreshConfig(null, this.configFile.contents)
    this.configFile.onDidChange(this._refreshConfig.bind(this))
  }

  get schema() {
    return this._schema || (this._schema = new Schema)
  }

  get emitter() {
    return this._emitter || (this._emitter = new Emitter)
  }

  get configFile() {
    return this._config_file || (this._config_file = new ConfigFile)
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

    return this.configFile.update(keyPath, value)
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

    return this.configFile.contents = this.contents
  }

  setProfileName(id, newName) {
    this.contents.profiles[id].name = newName

    return this.configFile.contents = this.contents
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

    this.configFile.contents = this.contents

    return id
  }

  destroyProfile(id) {
    delete this.contents.profiles[id]

    return this.configFile.contents = this.contents
  }

  validateActiveProfile() {
    if ((this.activeProfileId != null) && (this.activeProfile != null)) { return }

    if (Object.keys(this.profiles)[0] != null) {
      return this.setActiveProfileId(Object.keys(this.profiles)[0])
    } else {
      return this.configFile.contents = {activeProfileId: 1, profiles: { 1: { id: 1 } }}
    }
  }

  settingScopes() {
    return this.schema.settingScopes()
  }

  fieldsInSettingScope(scope) {
    return this.schema.bySettingScope()[scope]
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
}
