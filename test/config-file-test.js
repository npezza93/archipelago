/* global describe, it, afterEach, beforeEach, before */

const {homedir} = require('os')
const {join} = require('path')
const fs = require('fs')
const {app} = require('electron')
const CSON = require('season')
const {assert} = require('chai')
const ConfigFile = require('../app/config-file')

describe('ConfigFile', () => {
  before(() => {
    this.filePath = join(homedir(), '.archipelago.dev.json')
  })

  describe('no config file exists', () => {
    beforeEach(done => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })

    afterEach(done => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })

    it('creates a config file', () => {
      assert.isNull(CSON.resolve(this.filePath))
      const configFile = new ConfigFile()
      assert.isNotNull(CSON.resolve(this.filePath))
      assert(configFile.fileExists())
    })

    it('writes the current version', () => {
      const configFile = new ConfigFile()
      assert.deepEqual(configFile.read(), {version: app.getVersion()})
    })
  })

  describe('update', () => {
    beforeEach(done => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })

    afterEach(done => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })

    it('writes a field', () => {
      const configFile = new ConfigFile()
      configFile.update('thing', 'field')

      assert.deepEqual(
        configFile.read(),
        {version: app.getVersion(), thing: 'field'}
      )
    })
  })

  describe('runs migrations', () => {
    beforeEach(() => {
      CSON.writeFileSync(this.filePath, {})
    })

    afterEach(done => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })

    it('upgrades the version and runs migrations', () => {
      const currentContents = CSON.readFileSync(this.filePath)
      assert.deepEqual(currentContents, {})
      const configFile = new ConfigFile()
      assert.deepEqual(configFile.read(), {version: app.getVersion()})
    })
  })
})
