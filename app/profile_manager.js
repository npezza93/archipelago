const { Emitter } = require('event-kit')
const Profile     = require('./profile')

module.exports =
class ProfileManager {
  constructor(configFile) {
    this._configFile = configFile
    this._emitter    = new Emitter
  }

  get configFile() {
    return this._configFile
  }

  get emitter() {
    return this._emitter
  }

  set activeProfileId(id) {
    this.configFile.update('activeProfileId', parseInt(id))

    return parseInt(id)
  }

  get rawProfiles() {
    return this.configFile.contents.profiles || {}
  }

  get profileIds() {
    return Object.keys(this.rawProfiles)
  }

  any() {
    return this.profileIds.length > 0
  }

  activeProfile() {
    return this.find(this.configFile.contents.activeProfileId)
  }

  all() {
    return this.profileIds.map((id) => {
      return new Profile(this.rawProfiles[id], this._configFile)
    })
  }

  find(id) {
    if (this.rawProfiles[id]) {
      return new Profile(this.rawProfiles[id], this._configFile)
    } else {
      return null
    }
  }

  create() {
    const id = Math.max(0, Math.max(...this.profileIds)) + 1

    this.configFile.update(`profiles.${id}`, { 'id': id})
    this.configFile.update('activeProfileId', id)

    return this.find(id)
  }

  validate() {
    if (this.activeProfile() != null) { return }

    if (this.any()) {
      this.activeProfileId = this.profileIds[0]
    } else {
      this.create()
    }
  }

  onActiveProfileChange(callback) {
    let oldValue = this.activeProfile()
    return this.configFile.onDidChange(() => {
      const newValue = this.activeProfile()
      if (oldValue.id !== newValue.id) {
        oldValue = newValue
        return callback(newValue)
      }
    })
  }
}
