const Profile = require('./profile')
const {keybindings} = require('./config-file')

module.exports =
class ProfileManager {
  constructor(configFile) {
    this.configFile = configFile
  }

  set activeProfileId(id) {
    this.configFile.set('activeProfileId', parseInt(id, 10))

    return parseInt(id, 10)
  }

  get rawProfiles() {
    return this.configFile.get('profiles') || []
  }

  get profileIds() {
    return this.rawProfiles.map(profile => profile.id)
  }

  any() {
    return this.profileIds.length > 0
  }

  activeProfile() {
    return this.find(this.configFile.get('activeProfileId'))
  }

  all() {
    return this.rawProfiles.map(profile => {
      return new Profile(profile, this.configFile)
    })
  }

  find(id) {
    return this.all().find(profile => profile.id === id)
  }

  create() {
    const id = Math.max(0, Math.max(...this.profileIds)) + 1
    const index = this.profileIds.length

    this.configFile.set(`profiles.${index}`, {id, keybindings, theme: {}})
    this.configFile.set('activeProfileId', id)

    return this.find(id)
  }

  validate() {
    if (this.activeProfile() === undefined) {
      this.resetActiveProfile(this.profileIds[0])
    }

    this.all().forEach(profile => {
      if (profile.get('keybindings') === undefined) {
        profile.set('keybindings', keybindings)
      }
    })
  }

  get(keyPath) {
    return this.activeProfile().get(keyPath)
  }

  set(keyPath, value) {
    return this.activeProfile().set(keyPath, value)
  }

  onDidChange(keyPath, callback) {
    let oldValue = this.get(keyPath)

    const onChange = () => {
      const newValue = this.get(keyPath)
      if (oldValue !== newValue) {
        oldValue = newValue
        return callback(newValue)
      }
    }

    return this.configFile.events.on('change', onChange)
  }

  onActiveProfileChange(callback) {
    let oldValue = this.activeProfile()
    const disposable = this.configFile.onDidChange('activeProfileId', () => {
      const newValue = this.activeProfile()
      if (oldValue && newValue && oldValue.id !== newValue.id) {
        oldValue = newValue
        return callback(newValue)
      }
    })

    return disposable
  }

  onProfileChange(callback) {
    let oldValue = this.all().length
    const disposable = this.configFile.onDidChange('profiles', () => {
      const newValue = this.all().length
      if (oldValue && newValue) {
        oldValue = newValue
        return callback()
      }
    })

    return disposable
  }

  resetActiveProfile(newActiveProfileId) {
    if (this.any()) {
      this.activeProfileId = newActiveProfileId
    } else {
      this.configFile.set('profiles', [])
      this.create()
    }
  }
}
