const fs = require('fs')
const {homedir} = require('os')
const {join} = require('path')
const ElectronStore = require('electron-store')

module.exports =
class ConfigFile extends ElectronStore {
  constructor() {
    const opts = {
      defaults: {version: require('../../package.json').version},
      migrations: {
        '3.0.0': store => {
          const filePath = join(homedir(), '.archipelago.json')
          if (fs.existsSync(filePath)) {
            store.store = JSON.parse(fs.readFileSync(filePath))
          }
        }
      }
    }

    super(opts)
  }
}
