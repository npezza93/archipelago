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
  this.timeout(20_000)

  beforeEach(() => {
    this.app = new Application({
      path: electron,
      verbose: true,
      args: [path.join(__dirname, '../../dist/main/main.js')]
    })
    this.app.args.unshift(path.join(__dirname, 'fake-menu-preload.js'))
    this.app.args.unshift('--require')

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

  it('renders the app', async () => {
    const element = await this.app.client.$('archipelago-app')
    assert.isTrue(await element.isExisting())
  })

  it('renders with no renderer process errors', () => {
    return this.app.client.getRenderProcessLogs().then(logs => {
      const filteredLogs = logs.filter(log => log.level === 'SEVERE')

      assert.isEmpty(filteredLogs, 'Exception in renderer process encountered')
    })
  })

  it('adds a new tab', async () => {
    await setSingleTabMode(false, this.app)
    const initalElements = await this.app.client.$$('archipelago-terminal')
    assert.equal(initalElements.length, 1)

    await clickMenu(this.app, ['Shell', 'New Tab'])

    const afterElements = await this.app.client.$$('archipelago-terminal')
    assert.equal(afterElements.length, 2)

    const tabElements = await this.app.client.$$('archipelago-tab')
    return assert.equal(tabElements.length, 2)
  })

  describe('tab closures', () => {
    it('closes a tab', async () => {
      await setSingleTabMode(false, this.app)
      await clickMenu(this.app, ['Shell', 'New Tab'])
      let tabElements = await this.app.client.$$('archipelago-terminal')
      assert.equal(tabElements.length, 2)

      const closeButton = await this.app.client.$('archipelago-tab div')
      await closeButton.click()
      tabElements = await this.app.client.$$('archipelago-terminal')
      assert.equal(tabElements.length, 1)
    })

    it('close button doesnt appear on last tab', async () => {
      await setSingleTabMode(false, this.app)
      const tabElements = await this.app.client.$$('archipelago-terminal')
      assert.equal(tabElements.length, 1)

      const closeButton = await this.app.client.$('archipelago-tab div')
      assert.isFalse(await closeButton.isDisplayed())
    })
  })
})

function setSingleTabMode(checked, app) {
  return app.electron.ipcRenderer.send('SPECTRON_SET_PROPERTY/SEND', {property: 'singleTabMode', value: checked})
}

function clickMenu(app, labels) {
  return app.electron.ipcRenderer.send('SPECTRON_FAKE_MENU/SEND', labels)
}
