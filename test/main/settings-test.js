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

describe('Settings', function () {
  this.timeout(10_000)

  beforeEach(() => {
    this.app = new Application({
      path: electron,
      verbose: true,
      env: {PAGE: 'settings'},
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

  it('renders with no renderer process errors', () => {
    return this.app.client.getRenderProcessLogs().then(logs => {
      const filteredLogs = logs.filter(log => log.level === 'SEVERE')

      assert.isEmpty(filteredLogs, 'Exception in renderer process encountered')
    })
  })

  it('renders settings', async () => {
    const element = await this.app.client.$('#settings')
    assert.isTrue(await element.isExisting())
  })

  describe('profiles', () => {
    it('shows the profiles', async () => {
      const menu = await this.app.client.$('hamburger-menu')
      if (await menu.isDisplayed()) {
        await menu.click()
      }

      const profiles = await this.app.client.$$('profile-container')
      assert.isTrue(profiles.length >= 1)
    })

    it('creates a profile', async () => {
      const menu = await this.app.client.$('hamburger-menu')
      if (await menu.isDisplayed()) {
        await menu.click()
      }

      const initialProfiles = await this.app.client.$$('profile-container')
      const creator = await this.app.client.$('create-profile')
      await creator.click()

      const afterProfiles = await this.app.client.$$('profile-container')
      assert.equal(initialProfiles.length + 1, afterProfiles.length)

      clickMenu(this.app, ['View', 'Reload'])
      const list = await this.app.client.$('profiles-list')
      await list.waitForDisplayed()
      const reloadedProfiles = await this.app.client.$$('profile-container')
      assert.equal(reloadedProfiles.length, afterProfiles.length)
    })

    it('destroys a profile', async () => {
      const menu = await this.app.client.$('hamburger-menu')
      if (await menu.isDisplayed()) {
        await menu.click()
      }

      const creator = await this.app.client.$('create-profile')
      await creator.click()
      const initialProfiles = await this.app.client.$$('profile-container')

      const remover = await this.app.client.$('remove-profile')
      await remover.moveTo()
      await remover.click()

      const afterProfiles = await this.app.client.$$('profile-container')
      assert.equal(initialProfiles.length - 1, afterProfiles.length)

      clickMenu(this.app, ['View', 'Reload'])
      const list = await this.app.client.$('profiles-list')
      await list.waitForDisplayed()
      const reloadedProfiles = await this.app.client.$$('profile-container')
      assert.equal(reloadedProfiles.length, afterProfiles.length)
    })
  })
})

function clickMenu(app, labels) {
  return app.electron.ipcRenderer.send('SPECTRON_FAKE_MENU/SEND', labels)
}
