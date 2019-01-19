const fs = require('fs')
const {homedir} = require('os')
const {join} = require('path')
const Pref = require('pref')
const schema = require('../common/schema')

const pref = () => {
  return new Pref({
    schema,
    watch: false,
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

          if (store.get(`profiles.${index}.visor`) === undefined) {
            store.set(`profiles.${index}.visor`, {})
          }

          if (!['none', 'sound'].includes(store.get(`profiles.${index}.bellStyle`))) {
            store.set(`profiles.${index}.bellStyle`, 'sound')
          }
        })
      }
    }
  })
}

module.exports = {pref}
