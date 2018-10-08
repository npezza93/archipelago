import {Menu} from 'electron'
import ipc from 'electron-better-ipc'

export default function (profileManager) {
  ipc.answerRenderer('get-preferences-async', preferences => {
    return getPreferences(profileManager, preferences)
  })

  ipc.answerRenderer('create-profile', () => {
    const profile = profileManager.create()

    return {newProfile: profile, profiles: profileManager.all()}
  })

  ipc.answerRenderer('destroy-profile', id => {
    const profile = profileManager.find(id)

    if (profileManager.activeProfile().id === profile.id) {
      const newActiveProfileId = profileManager.profileIds.find(profileId => {
        return profileId !== profile.id
      })
      profileManager.resetActiveProfile(newActiveProfileId)
    }

    profile.destroy()

    return {activeProfileId: profileManager.activeProfile().id,
      profiles: profileManager.all()}
  })

  ipc.answerRenderer('set-profile-pref', ({id, prefName, prefValue}) => {
    profileManager.find(id).set(prefName, prefValue)
  })

  ipc.answerRenderer('set-active-profile', activeProfileId => {
    profileManager.activeProfileId = activeProfileId
  })

  ipc.answerRenderer('open-hamburger-menu', args => Menu.getApplicationMenu().popup(args))

  ipc.on('get-preferences-sync', (event, preferences) => {
    event.returnValue = getPreferences(profileManager, preferences)
  })

  ipc.on('activeProfileId', event => {
    event.returnValue = profileManager.activeProfile().id
  })

  ipc.on('profiles', event => {
    event.returnValue = profileManager.all()
  })
}

const getPreferences = (profileManager, preferences) => {
  switch (preferences.constructor.name) {
    case 'String':
      return profileManager.get(preferences)
    case 'Array':
      return preferences.reduce((foundPreferences, setting) => {
        foundPreferences[setting] = profileManager.get(setting)

        return foundPreferences
      }, {})
    default:
      return null
  }
}
