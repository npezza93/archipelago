BaseField      = require('./base_field')
nestedProperty = require('nested-property')

class SwitchField extends BaseField
  constructor: (id, label) ->
    super()
    @dataset['id'] = @dataset.id || id
    @dataset['label'] = @dataset.label || label

  setInnerHTML: ->
    @setAttribute('style', 'margin-top:25px;display:flex;flex-direction:row;')

    @append(@label())
    @append(@switch())

  attachListeners: ->
    @input.addEventListener 'change', () =>
      @updateSetting(@valueKey(), @input.checked)

  updateValue: (newValue) ->
    if newValue?
      @querySelector('input').setAttribute('checked', newValue)
    else
      @querySelector('input').removeAttribute('checked')

  switch: ->
    mdcSwitch = document.createElement('div')
    mdcSwitch.classList = 'mdc-switch'

    mdcSwitch.append(@input())
    mdcSwitch.append(@knob())

    mdcSwitch

  input: ->
    @input = document.createElement('input')
    @input.setAttribute('type', 'checkbox')
    @input.setAttribute('id', @dataset.id)
    @input.setAttribute('class', 'mdc-switch__native-control')
    @input.setAttribute('checked', @currentValue)

    @input

  knob: ->
    background = document.createElement('div')
    background.classList = 'mdc-switch__background'

    knob = document.createElement('div')
    knob.classList = 'mdc-switch__knob'

    background.append(knob)

    background

  label: ->
    label = document.createElement('label')
    label.innerText = @dataset.label
    label.classList = 'mdc-switch-label'
    label.style.flex = 1
    label.setAttribute('for', @dataset.id)

    label

module.exports = SwitchField
window.customElements.define('switch-field', SwitchField)
