module.exports = {
  run(contents) {
    if (contents.activeProfileId === undefined) {
      contents.activeProfileId = contents.activeProfile
      delete contents.activeProfile
    }

    for (let profileId of Object.keys(contents.profiles || {})) {
      delete contents.profiles[profileId].keybindings
    }

    return contents
  }
}
