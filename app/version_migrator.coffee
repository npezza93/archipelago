class VersionMigrator
  versions: ['1.0.5', '2.0.0']

  constructor: (config, currentVersion) ->
    @config = config
    @currentVersion = currentVersion

  run: ->
    currentIndex = @versions.indexOf(@currentVersion)
    for version, index in @versions
      if index > currentIndex
        require("./migrations/#{version}").run()
