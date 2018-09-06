/* global describe, beforeEach, afterEach, it */

const path = require('path')
const {Application} = require('spectron')
const {assert} = require('chai')

const ConfigFile = require('../app/config-file')

let electron = './node_modules/electron/dist/'

if (process.platform === 'darwin') {
  electron += 'Electron.app/Contents/MacOS/Electron'
} else if (process.platform === 'linux') {
  electron += 'electron'
}

describe('Application launch', function () {
  this.timeout(10000)

  beforeEach(() => {
    (new ConfigFile()).clear()
    this.app = new Application({
      path: electron,

      args: [path.join(__dirname, '../app/main/index.js')]
    })
    return this.app.start()
  })

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('renders with no main process errors', () => {
    return this.app.client.getWindowCount().then(count => {
      assert.equal(count, 1)
    })
  })

  it('renders with no renderer process errors', () => {
    return this.app.client.getRenderProcessLogs().then(logs => {
      const filteredLogs = logs.filter(log => log.level === 'SEVERE')

      assert.isEmpty(filteredLogs, 'Exception in renderer process encountered')
    })
  })
})
