/* global describe, beforeEach, it */

const {configure} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

configure({adapter: new Adapter()})

const React = require('react')
const {mount} = require('enzyme')
const {assert} = require('chai')

const {pref} = require('../../app/configuration/config-file')
const ProfileComponent = require('../../app/settings/profile')
const Profile = require('../../app/configuration/profile')
const ProfileManager = require('../../app/configuration/profile-manager')

describe('Profile Component', () => {
  describe('more than 1 profile', () => {
    beforeEach(() => {
      pref.store = {activeProfileId: 1, profiles: [{id: 1, theme: {}}, {id: 2, theme: {}}]}
      this.profileManager = new ProfileManager(pref)

      this.profile = new Profile({id: 1, theme: {}}, pref)
    })

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
      pref.store = {activeProfileId: 1, profiles: [{id: 1, theme: {}}]}
      this.profileManager = new ProfileManager(pref)

      this.profile = new Profile({id: 1, theme: {}}, pref)
    })

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
