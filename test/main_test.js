/* global describe, beforeEach, afterEach, it */

const { Application } = require('spectron')
const { assert }      = require('chai')
const path            = require('path')
let electron = './node_modules/electron/dist/'

if (process.platform == 'darwin') {
  electron += 'Electron.app/Contents/MacOS/Electron'
} else if (process.platform == 'linux') {
  electron += 'electron'
}

describe('Application launch', function() {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      path: electron,

      args: [path.join(__dirname, '../app/main/index.js')]
    })
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
    })
  })
})
