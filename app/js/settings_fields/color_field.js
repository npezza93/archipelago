const BaseField = require(join(__dirname, '/base_field'))
const nestedProperty = require('nested-property')

class ColorField extends BaseField {
  constructor(id, label, value = undefined) {
    super()
    this.dataset['id'] = this.dataset.id || id
    this.dataset['valueKey'] = this.dataset.valueKey || 'theme.' + this.dataset.id
    this.dataset['label'] = this.dataset.label || label
    this.dataset['value'] = nestedProperty.get(this.currentSettings(), this.dataset.valueKey) ||
      this.dataset.value || value || ''

    this.setInnerHTML()
  }

  setInnerHTML() {
    this.mdcElement = document.createElement('div')
    this.mdcElement.classList = 'd-flex'
    this.mdcElement.style.paddingTop = '8px'

    this.mdcElement.innerHTML = this._label() + this._inputField()

    this.append(this.mdcElement)
  }

  attachListeners() {
    this.mdcElement.addEventListener('change', () => {
      this.updateSetting(this.dataset.valueKey, this.querySelector('input').value)
    })
  }

  _inputField() {
    let element = document.createElement('input')
    element.type = 'text'
    element.id = this.dataset.id
    element.setAttribute('style', 'width:200px;padding:0;font-size:16px;border:0;text-align: end;')
    if (this.dataset.value) element.setAttribute('value', this.dataset.value)

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
