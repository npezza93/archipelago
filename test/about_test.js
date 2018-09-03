/* global describe, beforeEach, afterEach, it */

const { Application } = require('spectron')
const { assert }      = require('chai')
const path            = require('path')
const electron        = './node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'

describe('About launch', function() {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      path: electron,

      args: [path.join(__dirname, './fixtures/about.js')]
    })
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows about window', function () {
    this.app.client.getWindowCount().then((count) => {
      assert.equal(count, 1)
    })
  })

  it('displays the current app version', function() {
    this.app.client.waitUntilWindowLoaded().getText('#version').then((text) => {
      this.app.electron.remote.app.getVersion().then((currentVersion) => {
        assert.equal(text, currentVersion)
      })
    })
  })
})
