/* global describe, it */

const {assert} = require('chai')
const ConfigFile = require('../fixtures/config-file-mock')

describe('migration to 2.0.0', () => {
  it('migrate from activeProfile to activeProfileId', () => {
    const configFile = new ConfigFile()
    configFile.contents = {activeProfile: 1}

    configFile.migrateVersions()

    assert.deepEqual(
      configFile.contents,
      {version: '3000', activeProfileId: 1}
    )
  })

  it('removes all stored keybindings', () => {
    const configFile = new ConfigFile()
    configFile.contents = {
      activeProfileId: 1, profiles: {1: {keybindings: ['thing']}}
    }

    configFile.migrateVersions()

    assert.deepEqual(
      configFile.contents,
      {activeProfileId: 1, version: '3000', profiles: {1: {}}}
    )
  })
})
