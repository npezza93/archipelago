const {Emitter} = require('event-kit')
const Profile = require('./profile')

module.exports =
class ProfileManager {
  constructor(configFile) {
    this.configFile = configFile
    this._emitter = new Emitter()
  }

  get emitter() {
    return this._emitter
  }

  set activeProfileId(id) {
    this.configFile.set('activeProfileId', parseInt(id, 10))

    return parseInt(id, 10)
  }

  get rawProfiles() {
    return this.configFile.get('profiles') || {}
  }

  get profileIds() {
    return Object.keys(this.rawProfiles)
  }

  any() {
    return this.profileIds.length > 0
  }

  activeProfile() {
    return this.find(this.configFile.get('activeProfileId'))
  }

  all() {
    return this.profileIds.map(id => {
      return new Profile(this.rawProfiles[id], this.configFile)
    })
  }

  find(id) {
    if (this.rawProfiles[id]) {
      return new Profile(this.rawProfiles[id], this.configFile)
    }
    return null
  }

  create() {
    const id = Math.max(0, Math.max(...this.profileIds)) + 1

    this.configFile.set(`profiles.${id}`, {id})
    this.configFile.set('activeProfileId', id)

    return this.find(id)
  }

  validate() {
    if (this.activeProfile() !== null) {
      return
    }

    if (this.any()) {
      this.activeProfileId = this.profileIds[0]
    } else {
      this.create()
    }
  }

  onActiveProfileChange(callback) {
    let oldValue = this.activeProfile()
    return this.configFile.onDidChange('activeProfileId', () => {
      const newValue = this.activeProfile()
      if (oldValue && newValue && oldValue.id !== newValue.id) {
        oldValue = newValue
        return callback(newValue)
      }
    })
  }
}
