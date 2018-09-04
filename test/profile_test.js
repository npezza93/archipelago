/* global describe, it, beforeEach, afterEach */

const { assert }  = require('chai')
const Profile     = require('../app/profile')
const ConfigFile  = require('../app/config_file')
const { homedir } = require('os')
const { join }    = require('path')
const fs          = require('fs')

describe('Profile', () => {
  beforeEach((done) => {
    this.filePath = join(homedir(), '.archipelago.dev.json')
    fs.unlink(this.filePath, () => {
      done()
    })
    this.profiles = {
      '1': {
        id: 1,
        name: 'Profile 1'
      },
      '2': { id: 2 }
    }
  })

  afterEach((done) => {
    fs.unlink(this.filePath, () => {
      done()
    })
  })

  it('returns the id', () => {
    const configFile = new ConfigFile
    const profile = new Profile(this.profiles[1], configFile)

    assert.equal(profile.id, 1)
  })

  it('returns the name', () => {
    const configFile = new ConfigFile
    const profile = new Profile(this.profiles[1], configFile)

    assert.equal(profile.name, 'Profile 1')
  })

  it('returns the default name', () => {
    const configFile = new ConfigFile
    const profile = new Profile(this.profiles[2], configFile)

    assert.equal(profile.name, 'New Profile')
  })

  it('sets the name', () => {
    const configFile = new ConfigFile
    configFile.update('profiles', this.profiles)
    const profile = new Profile(this.profiles[2], configFile)

    assert.equal(profile.name = 'Profile 3000', 'Profile 3000')

    assert.deepEqual(
      configFile.contents.profiles[2],
      { id: 2, name: 'Profile 3000' }
    )
  })

  it('destroys the profile', () => {
    const configFile = new ConfigFile
    configFile.update('profiles', this.profiles)
    const profile = new Profile(this.profiles[2], configFile)

    assert.equal(Object.keys(configFile.contents.profiles).length, 2)

    profile.destroy()

    assert.equal(Object.keys(configFile.contents.profiles).length, 1)
    assert.isUndefined(configFile.contents.profiles[2])
  })
})
