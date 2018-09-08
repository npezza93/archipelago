const ConfigFile = require('./config-file')
const ProfileManager = require('./profile-manager')

module.exports =
class Config {
  constructor() {
    this.configFile = new ConfigFile()
    this.profileManager = new ProfileManager(this.configFile)

    this.profileManager.validate()
  }

  get(keyPath, options) {
    return this.profileManager.activeProfile().get(keyPath, options)
  }

  set(keyPath, value) {
    return this.profileManager.activeProfile().set(keyPath, value)
  }

  onDidChange(keyPath, callback, options) {
    let oldValue = this.get(keyPath)
    const onChange = this.configFile.onDidChange(keyPath, () => {
      const newValue = this.get(keyPath, options)
      if (oldValue !== newValue) {
        oldValue = newValue
        return callback(newValue)
      }
    })

    return {dispose() {
      onChange.call()
    }}
  }

  on(event, callback) {
    return this.configFile.events.on(event, callback)
  }
}
