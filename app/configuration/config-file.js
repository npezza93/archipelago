const fs = require('fs')
const {homedir} = require('os')
const {join} = require('path')
const Pref = require('pref')

const schema = require('./schema.json')

const pref = () => {
  return new Pref({
    schema,
    migrations: {
      '3.0.0': store => {
        const filePath = join(homedir(), '.archipelago.json')
        if (fs.existsSync(filePath)) {
          const oldStore = JSON.parse(fs.readFileSync(filePath))
          const profiles = Object.values(oldStore.profiles)
          oldStore.profiles = profiles
          store.store = oldStore
        }

        (store.store.profiles || []).forEach((profile, index) => {
          if (store.get(`profiles.${index}.theme`) === undefined) {
            store.set(`profiles.${index}.theme`, {})
          }
        })
      }
    }
  })
}

const allProperties = schema.properties.profiles.items.properties

const xtermSettings = Object.keys(allProperties).filter(property => {
  return allProperties[property].scope === 'xterm'
})

module.exports = {pref, xtermSettings}
