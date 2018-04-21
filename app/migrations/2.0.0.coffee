module.exports =
  run: (config) ->
    contents = config.contents

    if contents.activeProfileId == undefined
      contents.activeProfileId = contents.activeProfile
      delete contents.activeProfile

    for profileId in Object.keys(contents.profiles)
      delete contents.profiles[profileId].keybindings

    contents.version = '2.0.0'

    config._writeSync(contents)
