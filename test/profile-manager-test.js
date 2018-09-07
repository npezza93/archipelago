/* global describe, it, beforeEach, afterEach */

const {assert} = require('chai')
const ProfileManager = require('../app/configuration/profile-manager')
const Profile = require('../app/configuration/profile')
const ConfigFile = require('../app/configuration/config-file')

describe('ProfileManager', () => {
  beforeEach(() => {
    (new ConfigFile()).clear()
    this.configFile = new ConfigFile()
    this.profiles = {
      1: {
        id: 1,
        name: 'Profile 1'
      },
      2: {
        id: 2,
        name: 'Profile 2'
      }
    }
  })

  afterEach(() => {
    this.configFile.clear()
  })

  describe('all', () => {
    it('grabs all profiles', () => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)

      assert.equal(manager.all().length, 2)
    })

    it('doesnt error when no config file initially exists', () => {
      const manager = new ProfileManager(this.configFile)

      assert.equal(manager.all().length, 0)
    })
  })

  describe('find', () => {
    it('grabs the given profile', () => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)

      const foundProfile = manager.find(1)

      assert.instanceOf(foundProfile, Profile)
      assert.equal(foundProfile.id, 1)
      assert.equal(foundProfile.name, 'Profile 1')
    })

    it('returns null when no profile is found', () => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)

      const foundProfile = manager.find(3)

      assert.isNull(foundProfile)
    })

    it('doesnt error when no config file initially exists', () => {
      const manager = new ProfileManager(this.configFile)

      const foundProfile = manager.find(1)

      assert.isNull(foundProfile)
    })
  })

  describe('activeProfile', () => {
    it('sets the active profile', () => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)

      assert.isNull(manager.activeProfile())

      assert.equal(manager.activeProfileId = 1, 1)

      assert.instanceOf(manager.activeProfile(), Profile)
      assert.equal(manager.activeProfile().id, 1)
      assert.equal(manager.activeProfile().name, 'Profile 1')
    })
  })

  describe('create', () => {
    it('saves a new profile', () => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)

      assert.equal(manager.create().id, 3)

      assert.equal(manager.activeProfile().id, 3)
      assert.deepEqual(
        this.configFile.get('profiles'),
        {
          1: {id: 1, name: 'Profile 1'},
          2: {id: 2, name: 'Profile 2'},
          3: {id: 3}
        }
      )
    })
  })

  describe('validate', () => {
    it('creates a profile if none exist', () => {
      const manager = new ProfileManager(this.configFile)

      assert.equal(manager.profileIds, 0)
      assert.isNull(manager.activeProfile())

      manager.validate()

      assert.equal(manager.profileIds, 1)
      assert.isNotNull(manager.activeProfile())
    })

    it('does nothing if an activeProfile exists', () => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)
      manager.activeProfileId = 1

      assert.isNotNull(manager.activeProfile())
      assert.equal(manager.profileIds.length, 2)

      manager.validate()

      assert.equal(manager.profileIds.length, 2)
    })

    it('resets the activeProfile if it was deleted', () => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)
      manager.activeProfileId = 3

      assert.isNull(manager.activeProfile())
      assert.equal(manager.profileIds.length, 2)

      manager.validate()

      assert.equal(manager.profileIds.length, 2)
      assert.isNotNull(manager.activeProfile())
      assert.equal(manager.activeProfile().id, 1)
    })
  })

  describe('on active profile change', () => {
    it('triggers the callback when the active profile changes', done => {
      this.configFile.set('profiles', this.profiles)
      const manager = new ProfileManager(this.configFile)
      manager.activeProfileId = 1

      manager.onActiveProfileChange(newActiveProfile => {
        assert.equal(newActiveProfile.id, 2)
        done()
      })

      manager.activeProfileId = 2
    })
  })
})
