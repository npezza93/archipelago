const ConfigFile = require('./config-file')
const ProfileManager = require('./profile-manager')
const Config = require('./config')

module.exports = {
  configFile: new ConfigFile(),
  config: new Config(),
  profileManager: new ProfileManager(new ConfigFile())
}
