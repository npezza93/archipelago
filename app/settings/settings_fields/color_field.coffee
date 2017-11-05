BaseField      = require('./base_field')
nestedProperty = require('nested-property')

class ColorField extends BaseField
  constructor: (id, label) ->
    super()
    @dataset['id'] = @dataset.id || id
    @dataset['label'] = @dataset.label || label

  setInnerHTML: ->
    element = document.createElement('div')
    element.classList = 'd-flex'
    element.style.paddingTop = '8px'

    element.innerHTML = @label() + @input()

    @append(element)

  attachListeners: ->
    @querySelector('input').addEventListener 'change', () =>
      @updateSetting(@valueKey(), @querySelector('input').value)

  updateValue: (newValue) ->
    input = @querySelector('input')
    input.setAttribute('value', newValue)
    input.value = newValue

    input.style.backgroundColor = newValue

  input: ->
    element = document.createElement('input')
    element.type = 'text'
    element.id = @dataset.id

    element.setAttribute('value', @currentValue) if @currentValue?

    element.outerHTML

  label: ->
    element = document.createElement('label')
    element.for = @dataset.id
    element.style.flex = 1
    element.innerText = @dataset.label

    element.outerHTML

module.exports = ColorField
window.customElements.define('color-field', ColorField)
