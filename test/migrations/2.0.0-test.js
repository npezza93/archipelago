/* global describe, it, beforeEach, afterEach */

const {assert} = require('chai')
const ConfigFile = require('../../app/config-file')

const pkg = require('../../package.json')

describe('migration to 2.0.0', () => {
  beforeEach(() => {
    (new ConfigFile()).clear()
    this.configFile = new ConfigFile()
  })

  afterEach(() => {
    this.configFile.clear()
  })

  it('migrate from activeProfile to activeProfileId', () => {
    this.configFile.set('activeProfile', 1)
    this.configFile.set('version', '1.0.5')

    this.configFile.migrateVersions()

    assert.deepEqual(
      this.configFile.store,
      {version: pkg.version, activeProfileId: 1}
    )
  })

  it('removes all stored keybindings', () => {
    this.configFile.set('activeProfile', 1)
    this.configFile.set('profiles.1.keybindings', ['thing'])
    this.configFile.set('version', '1.0.5')

    this.configFile.migrateVersions()

    assert.deepEqual(
      this.configFile.store,
      {activeProfileId: 1, version: pkg.version, profiles: {1: {}}}
    )
  })
})
