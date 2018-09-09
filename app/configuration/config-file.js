const fs = require('fs')
const {homedir} = require('os')
const {join} = require('path')
const ElectronStore = require('electron-store')

const Schema = require('./schema')

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

    this.events.setMaxListeners((new Schema()).xtermSettings().length)
  }
}
