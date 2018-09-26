/* global describe, it, beforeEach */

const {assert} = require('chai')
const Profile = require('../../app/configuration/profile')
const ProfileManager = require('../../app/configuration/profile-manager')
const {pref} = require('../../app/configuration/config-file')

describe('Profile', () => {
  beforeEach(() => {
    this.profiles = [
      {id: 1, name: 'Profile 1'},
      {id: 2}
    ]
    pref.set('profiles', this.profiles)
  })

  it('returns the id', () => {
    const profile = new Profile(this.profiles[0], pref)

    assert.equal(profile.id, 1)
  })

  it('returns the name', () => {
    const profile = new Profile(this.profiles[0], pref)

    assert.equal(profile.name, 'Profile 1')
  })

  it('returns the default name', () => {
    const profile = new Profile(this.profiles[1], pref)

    assert.equal(profile.name, 'New Profile')
  })

  it('sets the name', () => {
    const profile = new Profile(this.profiles[1], pref)

    profile.name = 'Profile 3000'

    assert.deepEqual(
      pref.store.profiles[1],
      {id: 2, name: 'Profile 3000'}
    )
  })

  it('destroys the profile', () => {
    const profile = new Profile(this.profiles[1], pref)
    const profileManager = new ProfileManager(pref)

    assert.equal(profileManager.all().length, 2)

    profile.destroy()

    assert.equal(profileManager.all().length, 1)
    assert.isUndefined(profileManager.find(2))
  })

  it('handles getting values that are not for the given platform', () => {
    const oldPlatform = process.platform
    Object.defineProperty(process, 'platform', {value: 'linux'})
    pref.set('profiles', this.profiles)

    const profile = new Profile(this.profiles[1], pref)
    assert.equal(profile.get('vibrancy'), '')
    Object.defineProperty(process, 'platform', {value: oldPlatform})
  })
})
