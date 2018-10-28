import Pref from 'pref'
import schema from '../../common/schema'

export default class CurrentProfile {
  constructor() {
    this.pref = new Pref({schema, watch: false})
  }

  get(keyPath) {
    const index = this.pref.store.profiles.findIndex(profile => {
      return profile.id === this.pref.get('activeProfileId')
    })

    return this.pref.get(`profiles.${index}.${keyPath}`)
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
