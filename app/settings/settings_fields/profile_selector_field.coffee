require('../../utils/attr')

BaseField      = require('./base_field')
nestedProperty = require('nested-property')
Profile        = require('../profile')

class ProfileSelectorField extends BaseField
  @attr 'profile',
    get: ->
      @_profile
    set: (profile) ->
      @_profile = profile

  @attr 'input',
    get: ->
      return @_input if @_input?

      @_input = document.createElement('input')
      @_input.setAttribute('name', 'activeProfile')
      @_input.setAttribute('type', 'radio')
      @_input.setAttribute('id', @dataset.id)
      @_input.setAttribute('class', 'mdc-radio__native-control')
      if nestedProperty.get(@currentSettings(), 'activeProfile') == parseInt(@dataset.id)
        @_input.setAttribute('checked', true)

      @_input

  constructor: (id) ->
    super()
    @dataset['id'] = @dataset.id || id

  setInnerHTML: ->
    mdcRadio = document.createElement('div')
    mdcRadio.classList = 'mdc-radio'

    mdcRadio.append(@input)
    mdcRadio.append(@background())

    @append(mdcRadio)

  attachListeners: ->
    @input.addEventListener 'change', () =>
      checkedProfile = document.querySelector('profile-selector-field input:checked')
      profile = checkedProfile.parentElement.parentElement.profile

      @updateSetting('activeProfile', profile.id)

      profile.loadSettings()

  background: ->
    background = document.createElement('div')
    background.classList = 'mdc-radio__background'

    outer = document.createElement('div')
    outer.classList = 'mdc-radio__outer-circle'

    inner = document.createElement('div')
    inner.classList = 'mdc-radio__inner-circle'

    background.append(outer)
    background.append(inner)

    background

module.exports = ProfileSelectorField
window.customElements.define('profile-selector-field', ProfileSelectorField)
