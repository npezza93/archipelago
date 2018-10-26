/* global describe, beforeEach, afterEach, it */

const {configure} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

configure({adapter: new Adapter()})

const React = require('react')
const {mount} = require('enzyme')
const {assert} = require('chai')

const {pref} = require('../../../app/common/config-file')
const ProfileComponent = require('../../../app/renderer/settings/profile.jsx')
const Profile = require('../../../app/main/profile')
const ProfileManager = require('../../../app/main/profile-manager')

describe('Profile Component', () => {
  describe('more than 1 profile', () => {
    beforeEach(() => {
      this.pref = pref()
      this.pref.store = {activeProfileId: 1, profiles: [
        {id: 1, theme: {}}, {id: 2, theme: {}}
      ]}
      this.profileManager = new ProfileManager(this.pref)

      this.profile = new Profile({id: 1, theme: {}}, this.pref)
    })

    afterEach(() => this.pref.dispose())

    it('displays the profile remove button', () => {
      const component = mount(
        React.createElement(
          ProfileComponent, {
            profile: this.profile,
            profileManager: this.profileManager,
            activeProfile: this.profile
          }
        )
      )

      assert(component.find('.profile-remove').exists())
    })
  })

  describe('1 profile', () => {
    beforeEach(() => {
      this.pref = pref()
      this.pref.store = {activeProfileId: 1, profiles: [{id: 1, theme: {}}]}
      this.profileManager = new ProfileManager(this.pref)

      this.profile = new Profile({id: 1, theme: {}}, this.pref)
    })

    afterEach(() => this.pref.dispose())

    it('does not display the profile remove button', () => {
      const component = mount(
        React.createElement(
          ProfileComponent, {
            profile: this.profile,
            profileManager: this.profileManager,
            activeProfile: this.profile
          }
        )
      )

      assert(!component.find('.profile-remove').exists())
    })

    it('shows the input to edit the name', () => {
      const component = mount(
        React.createElement(
          ProfileComponent, {
            profile: this.profile,
            profileManager: this.profileManager,
            activeProfile: this.profile
          }
        )
      )

      assert(!component.state('editMode'))
      assert(!component.exists('input'))
      component.simulate('doubleclick')
      assert(component.state('editMode'))
      assert(component.exists('input'))
    })

    it('edits the name', () => {
      const component = mount(
        React.createElement(
          ProfileComponent, {
            profile: this.profile,
            profileManager: this.profileManager,
            activeProfile: this.profile
          }
        )
      )

      assert.equal(this.profile.name, 'New Profile')
      component.simulate('doubleclick')
      component.find('input').simulate('change', {target: {value: 'New Name'}})
      assert.equal(this.profile.name, 'New Name')
    })
  })
})
