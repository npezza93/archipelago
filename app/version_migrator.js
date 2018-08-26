const compareVersions = require('compare-versions');

module.exports =
class VersionMigrator {
  constructor(config, currentVersion, appVersion) {
    this.config = config;
    this.currentVersion = currentVersion;
    this.appVersion = appVersion;
  }

  run() {
    for (let version of this.versions()) {
      require(`./migrations/${version}`).run(this.config);
    }

    this.updateCurrentVersion();
  }

  versions() {
    return fs.readdirSync('./app/migrations').map((fileName) => {
      return fileName.substring(0, 5)
    }).filter((version) => {
      return compareVersions(version, this.currentVersion) === 1;
    }).sort(compareVersions);
  }

  updateCurrentVersion() {
    const { contents } = this.config;

    contents.version = this.appVersion;

    this.config._writeSync(contents);
  }
};
