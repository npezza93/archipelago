compareVersions = require('compare-versions')

module.exports =
class VersionMigrator
  constructor: (config, currentVersion, appVersion) ->
    @config = config
    @currentVersion = currentVersion
    @appVersion = appVersion

  run: ->
    for version, index in @versions()
      require("./migrations/#{version}").run(@config)

  versions: ->
    fs.readdirSync('./app/migrations').map((fileName) ->
      fileName.substring(0, 5)
    ).filter((version) ->
      compareVersions(version, @currentVersion) == 1
    ).sort(compareVersions)

  updateCurrentVersion: ->
    contents = @config.contents

    contents.version = @appVersion

    @config._writeSync(contents)
