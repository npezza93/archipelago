const ConfigFile = require('./config-file')
const ProfileManager = require('./profile-manager')
const Config = require('./config')

const globalConfig = {
  configFile: new ConfigFile(),
  config: new Config(),
  profileManager: new ProfileManager(new ConfigFile())
}

globalConfig.profileManager.validate()

module.exports = globalConfig
