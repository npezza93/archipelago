/* global describe, it, beforeEach */

const {assert} = require('chai')
const Profile = require('../app/profile')
const ConfigFile = require('./fixtures/config-file-mock')

describe('Profile', () => {
  beforeEach(() => {
    this.profiles = {
      1: {
        id: 1,
        name: 'Profile 1'
      },
      2: {id: 2}
    }
    this.configFile = new ConfigFile()
  })

  it('returns the id', () => {
    const profile = new Profile(this.profiles[1], this.configFile)

    assert.equal(profile.id, 1)
  })

  it('returns the name', () => {
    const profile = new Profile(this.profiles[1], this.configFile)

    assert.equal(profile.name, 'Profile 1')
  })

  it('returns the default name', () => {
    const profile = new Profile(this.profiles[2], this.configFile)

    assert.equal(profile.name, 'New Profile')
  })

  it('sets the name', () => {
    this.configFile.update('profiles', this.profiles)
    const profile = new Profile(this.profiles[2], this.configFile)

    assert.equal(profile.name = 'Profile 3000', 'Profile 3000')

    assert.deepEqual(
      this.configFile.contents.profiles[2],
      {id: 2, name: 'Profile 3000'}
    )
  })

  it('destroys the profile', () => {
    this.configFile.update('profiles', this.profiles)
    const profile = new Profile(this.profiles[2], this.configFile)

    assert.equal(Object.keys(this.configFile.contents.profiles).length, 2)

    profile.destroy()

    assert.equal(Object.keys(this.configFile.contents.profiles).length, 1)
    assert.isUndefined(this.configFile.contents.profiles[2])
  })
})
