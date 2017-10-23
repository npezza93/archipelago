const BaseField = require(join(__dirname, '/base_field'))
const nestedProperty = require('nested-property')

class ColorField extends BaseField {
  constructor(id, label) {
    super()
    this.dataset['id'] = this.dataset.id || id
    this.dataset['label'] = this.dataset.label || label
  }

  setInnerHTML() {
    let element = document.createElement('div')
    element.classList = 'd-flex'
    element.style.paddingTop = '8px'

    element.innerHTML = this._label() + this._inputField()

    this.append(element)
  }

  attachListeners() {
    this.querySelector('input').addEventListener('change', () => {
      this.updateSetting(this.valueKey, this.querySelector('input').value)
    })
  }

  updateValue(newValue) {
    let input = this.querySelector('input')
    input.setAttribute('value', newValue)
    input.value = newValue

    input.style.backgroundColor = newValue
  }

  _inputField() {
    let element = document.createElement('input')
    element.type = 'text'
    element.id = this.dataset.id

    if (this.currentValue) element.setAttribute('value', this.currentValue)

    return element.outerHTML
  }

  _label() {
    let element = document.createElement('label')
    element.for = this.dataset.id
    element.style.flex = 1
    element.innerText = this.dataset.label

    return element.outerHTML
  }
}

module.exports = ColorField
window.customElements.define('color-field', ColorField)
