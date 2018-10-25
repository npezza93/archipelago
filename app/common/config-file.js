const fs = require('fs')
const {homedir} = require('os')
const {join} = require('path')
const Pref = require('pref')
const schema = require('./schema')

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
        })
      }
    }
  })
}

const allProperties = schema.properties.profiles.items.properties

const xtermSettings = Object.keys(allProperties).filter(property => {
  return allProperties[property].scope === 'xterm'
})

const debouncer = function (func, wait, immediate) {
  let timeout
  return function () {
    const context = this

    const later = function () {
      timeout = null
      if (!immediate) {
        func.apply(context)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context)
    }
  }
}

module.exports = {pref, xtermSettings, debouncer}
