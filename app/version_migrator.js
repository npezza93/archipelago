const fs              = require('fs')
const compareVersions = require('compare-versions')

module.exports =
class VersionMigrator {
  constructor(currentConfig, currentVersion, appVersion) {
    this.currentConfig  = currentConfig
    this.currentVersion = currentVersion
    this.appVersion     = appVersion
  }

  run() {
    for (let version of this.versions()) {
      this.currentConfig =
        require(`./migrations/${version}`).run(this.currentConfig)
    }

    return this.currentConfig
  }

  versions() {
    return fs.readdirSync('./app/migrations').map((fileName) => {
      return fileName.substring(0, 5)
    }).filter((version) => {
      return compareVersions(version, this.currentVersion) === 1
    }).sort(compareVersions)
  }
}
