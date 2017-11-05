mdc            = require('material-components-web/dist/material-components-web')
BaseField      = require('./base_field')
nestedProperty = require('nested-property')

class TextField extends BaseField
  constructor: (id, label, helpText) ->
    super()
    @dataset['id'] = @dataset.id || id
    @dataset['label'] = @dataset.label || label
    @dataset['helpText'] = @dataset.helpText || helpText || ''

  initializeMdcElement: ->
    mdc.textfield.MDCTextfield.attachTo(@mdcElement)

  setInnerHTML: ->
    @mdcElement = document.createElement('div')
    @mdcElement.classList = 'mdc-textfield mdc-textfield--upgraded'
    @mdcElement.style.width = '100%'

    @mdcElement.innerHTML = @input() + @label()

    @append(@mdcElement)

    @append(@help()) if @dataset.helpText

  attachListeners: ->
    @mdcElement.addEventListener 'change', () =>
      @updateSetting(@valueKey(), @querySelector('input').value)

  updateValue: (newValue) ->
    @querySelector('input').setAttribute('value', newValue)
    @querySelector('input').value = newValue

    if newValue?
      @querySelector('label').classList += ' mdc-textfield__label--float-above'
    else
      @querySelector('label').classList = 'mdc-textfield__label'

  input: ->
    element = document.createElement('input')
    element.type = 'text'
    element.id = @dataset.id
    element.classList = 'mdc-textfield__input'

    element.setAttribute('value', @currentValue) if @currentValue?

    element.outerHTML

  label: ->
    element = document.createElement('label')
    element.for = @dataset.id
    element.innerText = @dataset.label
    element.classList = 'mdc-textfield__label'

    if @currentValue?
      element.classList += ' mdc-textfield__label--float-above'

    element.outerHTML

  help: ->
    element = document.createElement('p')
    element.classList = 'mdc-textfield-helptext mdc-textfield-helptext--persistent'
    element.innerText = @dataset.helpText

    element

module.exports = TextField
window.customElements.define('text-field', TextField)
