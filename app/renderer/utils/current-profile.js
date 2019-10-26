import Pref from 'pref'
import schema from '../../common/schema.json'

export default class CurrentProfile {
  constructor() {
    this.pref = new Pref({schema, watch: false})
  }

  get(keyPath) {
    const index = this.allProfiles.findIndex(profile => {
      return profile.id === this.activeProfileId
    })

    return this.pref.get(`profiles.${index}.${keyPath}`)
  }

  get allProfiles() {
    return this.pref.store.profiles
  }

  get activeProfileId() {
    return this.pref.get('activeProfileId')
  }

  get allProperties() {
    return schema.properties.profiles.items.properties
  }

  get xtermSettings() {
    return Object.keys(this.allProperties).filter(property => {
      return this.allProperties[property].scope === 'xterm'
    })
  }
}
