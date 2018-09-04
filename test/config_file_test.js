/* global describe, it, afterEach, beforeEach, before */

const { assert }  = require('chai')
const ConfigFile  = require('../app/config_file')
const { homedir } = require('os')
const { join }    = require('path')
const fs          = require('fs')
const CSON        = require('season')
const { app }     = require('electron')

describe('ConfigFile', () => {
  before(() => {
    this.filePath = join(homedir(), '.archipelago.dev.json')
  })

  describe('no config file exists', () => {
    beforeEach(() => {
      fs.unlink(this.filePath, () => {})
    })

    afterEach((done) => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })

    it('creates a config file', () => {
      assert.isNull(CSON.resolve(this.filePath))
      new ConfigFile
      assert.isNotNull(CSON.resolve(this.filePath))
    })

    it('writes the current version', () => {
      const configFile = new ConfigFile
      assert.deepEqual(configFile.read(), { version: app.getVersion() })
    })
  })

  describe('update', () => {
    beforeEach(() => {
      fs.unlink(this.filePath, () => {})
    })

    afterEach((done) => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })

    it('writes a field', () => {
      const configFile = new ConfigFile
      configFile.update('thing', 'field')

      assert.deepEqual(
        configFile.read(),
        { version: app.getVersion(), thing: 'field' }
      )
    })
  })

  describe('runs migrations', () => {
    beforeEach(() => {
      CSON.writeFileSync(this.filePath, {})
    })

    afterEach((done) => {
      fs.unlink(this.filePath, () => {
        done()
      })
    })


    it('upgrades the version and runs migrations', () => {
      const currentContents = CSON.readFileSync(this.filePath)
      assert.deepEqual(currentContents, {})
      const configFile = new ConfigFile
      assert.deepEqual(configFile.read(), { version: app.getVersion() })
    })
  })
})
