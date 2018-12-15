export default profileManager => {
  return {
    label: 'Profiles',
    submenu:
      profileManager.all().map(profile => {
        const profileItem = {
          label: profile.name,
          type: 'radio',
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
