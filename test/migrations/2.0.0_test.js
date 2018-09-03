/* global describe, it, after, before */

const { assert }  = require('chai')
const ConfigFile  = require('../../app/config_file')
const { homedir } = require('os')
const { join }    = require('path')
const fs          = require('fs')
const CSON        = require('season')
const { app }     = require('electron')

describe('migration to 2.0.0', () => {
  before(() => {
    this.filePath = join(homedir(), '.archipelago.dev.json')
    fs.unlink(this.filePath, () => {})
  })

  after(() => {
    fs.unlink(this.filePath, () => {})
  })

  it('migrate from activeProfile to activeProfileId', () => {
    CSON.writeFileSync(this.filePath, { activeProfile: 1 })

    const configFile = new ConfigFile
    assert.deepEqual(
      configFile.read(),
      { version: app.getVersion(), activeProfileId: 1 }
    )
  })

  it('removes all stored keybindings', () => {
    CSON.writeFileSync(
      this.filePath,
      { profiles: { 1: { keybindings: ['thing'] } } }
    )

    const configFile = new ConfigFile
    assert.deepEqual(
      configFile.read(),
      { version: app.getVersion(), profiles: { 1: {} } }
    )
  })
})
