/* global describe, it, beforeEach, afterEach */

const {assert} = require('chai')
const Pref = require('pref')

const ProfileManager = require('../../app/configuration/profile-manager')
const Profile = require('../../app/configuration/profile')
const keybindings = require('../../app/configuration/default-keybindings')

describe('ProfileManager', () => {
  beforeEach(() => {
    (new Pref()).clear()
    this.pref = new Pref({watch: false})
    this.profiles = [
      {
        id: 1,
        name: 'Profile 1'
      },
      {
        id: 2,
        name: 'Profile 2'
      }
    ]
  })

  afterEach(() => {
    this.pref.clear()
  })

  describe('all', () => {
    it('grabs all profiles', () => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)

      assert.equal(manager.all().length, 2)
    })

    it('doesnt error when no config file initially exists', () => {
      const manager = new ProfileManager(this.pref)

      assert.equal(manager.all().length, 0)
    })
  })

  describe('find', () => {
    it('grabs the given profile', () => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)

      const foundProfile = manager.find(1)

      assert.instanceOf(foundProfile, Profile)
      assert.equal(foundProfile.id, 1)
      assert.equal(foundProfile.name, 'Profile 1')
    })

    it('returns undefined when no profile is found', () => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)

      const foundProfile = manager.find(3)

      assert.isUndefined(foundProfile)
    })

    it('doesnt error when no config file initially exists', () => {
      const manager = new ProfileManager(this.pref)

      const foundProfile = manager.find(1)

      assert.isUndefined(foundProfile)
    })
  })

  describe('activeProfile', () => {
    it('sets the active profile', () => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)

      assert.isUndefined(manager.activeProfile())

      assert.equal(manager.activeProfileId = 1, 1)

      assert.instanceOf(manager.activeProfile(), Profile)
      assert.equal(manager.activeProfile().id, 1)
      assert.equal(manager.activeProfile().name, 'Profile 1')
    })
  })

  describe('create', () => {
    it('saves a new profile', () => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)

      assert.equal(manager.create().id, 3)

      assert.equal(manager.activeProfile().id, 3)

      assert.deepEqual(
        this.pref.get('profiles'),
        [
          {id: 1, name: 'Profile 1'},
          {id: 2, name: 'Profile 2'},
          {id: 3, keybindings: keybindings[process.platform]}
        ]
      )
    })
  })

  describe('validate', () => {
    it('creates a profile if none exist', () => {
      const manager = new ProfileManager(this.pref)

      assert.equal(manager.profileIds, 0)
      assert.isUndefined(manager.activeProfile())

      manager.validate()

      assert.equal(manager.profileIds, 1)
      assert.isDefined(manager.activeProfile())
    })

    it('does nothing if an activeProfile exists', () => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)
      manager.activeProfileId = 1

      assert.isNotNull(manager.activeProfile())
      assert.equal(manager.profileIds.length, 2)

      manager.validate()

      assert.equal(manager.profileIds.length, 2)
    })

    it('resets the activeProfile if it was deleted', () => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)
      manager.activeProfileId = 3

      assert.isUndefined(manager.activeProfile())
      assert.equal(manager.profileIds.length, 2)

      manager.validate()

      assert.equal(manager.profileIds.length, 2)
      assert.isDefined(manager.activeProfile())
      assert.equal(manager.activeProfile().id, 1)
    })
  })

  describe('on active profile change', () => {
    it('triggers the callback when the active profile changes', done => {
      this.pref.set('profiles', this.profiles)
      const manager = new ProfileManager(this.pref)
      manager.activeProfileId = 1

      manager.onActiveProfileChange(newActiveProfile => {
        assert.equal(newActiveProfile.id, 2)
        done()
      })

      manager.activeProfileId = 2
    })
  })
})
