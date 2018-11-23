/* global describe, beforeEach, afterEach, it */

const path = require('path')
const {Application} = require('spectron')
const {assert} = require('chai')

let electron = './node_modules/electron/dist/'

electron = {
  darwin: electron + 'Electron.app/Contents/MacOS/Electron',
  linux: electron + 'electron',
  win32: electron
}[process.platform]

describe('Application launch', function () {
  this.timeout(10000)

  beforeEach(() => {
    this.app = new Application({
      path: electron,
      verbose: true,
      args: [path.join(__dirname, '../../dist/main/main.js')]
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

  it('renders the app', () => {
    assert(this.app.client.isExisting('archipelago-app'))
  })

  it('renders with no renderer process errors', () => {
    return this.app.client.getRenderProcessLogs().then(logs => {
      const filteredLogs = logs.filter(log => log.level === 'SEVERE')

      assert.isEmpty(filteredLogs, 'Exception in renderer process encountered')
    })
  })

  it('splits the terminal horizontally', () => {
    let keys
    if (process.platform === 'darwin') {
      keys = ['cmd', 's']
    } else {
      keys = ['ctrl', 's']
    }
    assertElementCount(this.app, 'archipelago-terminal', 1, () => {
      return this.app.client.keys(keys).then(() => {
        assertElementCount(this.app, 'archipelago-terminal', 2)
        assert(this.app.client.isExisting('.SplitPane.horizontal'))
        assert.isFalse(this.app.client.isExisting('.SplitPane.vertical'))
      })
    })
  })

  it('splits the terminal vertically', () => {
    let keys
    if (process.platform === 'darwin') {
      keys = ['cmd', 'shift', 's']
    } else {
      keys = ['ctrl', 'shift', 's']
    }
    assertElementCount(this.app, 'archipelago-terminal', 1, () => {
      return this.app.client.keys(keys).then(() => {
        assertElementCount(this.app, 'archipelago-terminal', 2)
        assert(this.app.client.isExisting('.SplitPane.vertical'))
        assert.isFalse(this.app.client.isExisting('.SplitPane.horizontal'))
      })
    })
  })
})

function assertElementCount(app, selector, length, callback) {
  app.client.elements(selector).then(elements => {
    assert.equal(elements.length, length)
    if (callback) {
      callback()
    }
  })
}
