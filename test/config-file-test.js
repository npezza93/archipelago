/* global describe, it, afterEach, beforeEach */

const {assert} = require('chai')

const ConfigFile = require('../app/configuration/config-file')

const pkg = require('../package.json')

describe('ConfigFile', () => {
  beforeEach(() => {
    (new ConfigFile()).clear()
    this.configFile = new ConfigFile()
  })

  afterEach(() => {
    this.configFile.clear()
  })

  it('writes the current version when no config file exists', () => {
    assert.deepEqual(this.configFile.store, {version: pkg.version})
  })

  it('writes a field', () => {
    this.configFile.set('thing', 'field')

    assert.deepEqual(
      this.configFile.store,
      {version: pkg.version, thing: 'field'}
    )
  })
})
