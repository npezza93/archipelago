module.exports =
class VersionMigrator
  versions: ['1.0.5', '2.0.0', '2.1.0', '2.1.1', '2.1.2', '2.2.0', '2.2.1']

  constructor: (config, currentVersion) ->
    @config = config
    @currentVersion = currentVersion

  run: ->
    currentIndex = @versions.indexOf(@currentVersion)
    for version, index in @versions
      if index > currentIndex
        require("./migrations/#{version}").run(@config)
