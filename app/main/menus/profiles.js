export default profileManager => {
  return {
    label: 'Profiles',
    submenu:
      profileManager.all().map((profile, index) => {
        const profileItem = {
          label: profile.name,
          type: 'radio',
          accelerator: `Cmd+${index + 1}`,
          click() {
            profileManager.activeProfileId = profile.id
          }
        }

        if (profileManager.activeProfile().id === profile.id) {
          profileItem.checked = true
        }

        return profileItem
      })
  }
}
