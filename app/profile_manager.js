const Profile = require('./profile')

module.exports =
class ProfileManager {
  constructor(configFile) {
    this._configFile = configFile
  }

  get configFile() {
    return this._configFile
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

    return id
  }

  validate() {
    if (this.activeProfile() != null) { return }

    if (this.profileIds.length === 0) {
      this.create()
    } else {
      this.activeProfileId = this.profileIds[0]
    }
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
}
