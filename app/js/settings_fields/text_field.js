const BaseField = require(join(__dirname, '/base_field'))
const nestedProperty = require('nested-property')

class TextField extends BaseField {
  constructor(id, valueKey, label, value = undefined, helpText = undefined) {
    super()
    this.dataset['id'] = this.dataset.id || id
    this.dataset['valueKey'] = this.dataset.valueKey || valueKey
    this.dataset['label'] = this.dataset.label || label
    this.dataset['value'] = this.dataset.value ||
    nestedProperty.get(this.currentSettings(), this.dataset.valueKey) || value || ''
    this.dataset['helpText'] = this.dataset.helpText || helpText || ''

    this.setInnerHTML()
  }

  initializeMdcElement() {
    mdc.textfield.MDCTextfield.attachTo(this.mdcElement)
  }

  setInnerHTML() {
    this.mdcElement = document.createElement('div')
    this.mdcElement.classList = 'mdc-textfield mdc-textfield--upgraded'
    this.mdcElement.style.width = "100%"

    this.mdcElement.innerHTML = this._inputField() + this._label()

    this.append(this.mdcElement)

    if (this.dataset.helpText) this.append(this._helpTag())
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
    element.classList = 'mdc-textfield__input'
    if (this.dataset.value) element.setAttribute('value', this.dataset.value)

    return element.outerHTML
  }

  _label() {
    let element = document.createElement('label')
    element.for = this.dataset.id
    element.innerText = this.dataset.label
    element.classList = 'mdc-textfield__label'

    if (this.dataset.value) {
      element.classList += ' mdc-textfield__label--float-above'
    }

    return element.outerHTML
  }

  _helpTag() {
    let element = document.createElement('p')
    element.classList = "mdc-textfield-helptext mdc-textfield-helptext--persistent"
    element.innerText = this.dataset.helpText

    return element
  }
}

module.exports = TextField
window.customElements.define('text-field', TextField)
