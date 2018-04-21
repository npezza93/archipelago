module.exports =
  {
    run: (config) ->
      @renameActiveProfile(config)
      @removeKeyboardShortcuts(config)

      config.contents.version = '2.0.0'
      config._write(config.contents)

    renameActiveProfile: (config) ->
      return if config.contents.activeProfileId?

      config.contents.activeProfileId = config.contents.activeProfile

      delete config.contents.activeProfile

    removeKeyboardShortcuts: (config) ->
      delete config.contents.keybindings
  }
