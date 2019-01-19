/* global describe, beforeEach, afterEach, it */

const path = require('path')
const {Application} = require('spectron')
const {assert} = require('chai')
const robot = require('robotjs')

let electron = './node_modules/electron/dist/'

electron = {
  darwin: electron + 'Electron.app/Contents/MacOS/Electron',
  linux: electron + 'electron',
  win32: electron
}[process.platform]

describe('Settings', function () {
  this.timeout(10000)

  beforeEach(() => {
    this.app = new Application({
      path: electron,
      verbose: true,
      env: {PAGE: 'settings'},
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

  it('renders with no renderer process errors', () => {
    return this.app.client.getRenderProcessLogs().then(logs => {
      const filteredLogs = logs.filter(log => log.level === 'SEVERE')

      assert.isEmpty(filteredLogs, 'Exception in renderer process encountered')
    })
  })

  it('renders settings', () => {
    assert(this.app.client.isExisting('#settings'))
  })

  describe('profiles', () => {
    it('shows the profiles', async () => {
      if (await this.app.client.isVisible('hamburger-menu')) {
        await this.app.client.click('hamburger-menu')
      }

      const profiles = await this.app.client.elements('profile-container')

      assert(profiles.value.length >= 1)
    })

    it('creates a profile', async () => {
      if (await this.app.client.isVisible('hamburger-menu')) {
        await this.app.client.click('hamburger-menu')
      }

      const initialProfiles = await this.app.client.elements('profile-container')
      await this.app.client.click('create-profile')
      const afterProfiles = await this.app.client.elements('profile-container')

      assert.equal(initialProfiles.value.length + 1, afterProfiles.value.length)

      robot.keyTap('r', cmdOrCtrl())
      await this.app.client.waitForVisible('profiles-list')
      const afterReloadProfiles = await this.app.client.elements('profile-container')
      assert.equal(afterReloadProfiles.value.length, afterProfiles.value.length)
    })

    it('destroys a profile', async () => {
      if (await this.app.client.isVisible('hamburger-menu')) {
        await this.app.client.click('hamburger-menu')
      }

      const initialProfiles = await this.app.client.elements('profile-container')
      await this.app.client.moveToObject('remove-profile')
      await this.app.client.click('remove-profile')
      const afterProfiles = await this.app.client.elements('profile-container')

      assert.equal(initialProfiles.value.length - 1, afterProfiles.value.length)

      robot.keyTap('r', cmdOrCtrl())
      await this.app.client.waitForVisible('profiles-list')
      const afterReloadProfiles = await this.app.client.elements('profile-container')
      assert.equal(afterReloadProfiles.value.length, afterProfiles.value.length)
    })
  })
})

function cmdOrCtrl() {
  let modifier
  if (process.platform === 'darwin') {
    modifier = 'command'
  } else {
    modifier = 'control'
  }

  return modifier
}
