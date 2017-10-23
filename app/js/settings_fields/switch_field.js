const BaseField = require(join(__dirname, '/base_field'))
const nestedProperty = require('nested-property')

class SwitchField extends BaseField {
  constructor(id, valueKey, label, value = undefined) {
    super()
    this.dataset['id'] = this.dataset.id || id
    this.dataset['valueKey'] = this.dataset.valueKey || valueKey
    this.dataset['label'] = this.dataset.label || label
    this.dataset['value'] = nestedProperty.get(this.currentSettings(), this.dataset.valueKey) ||
      this.dataset.value || value || ''

    this.setInnerHTML()
  }

  setInnerHTML() {
    this.setAttribute('style', 'margin-top:25px;display:flex;flex-direction:row;')

    this.append(this._label())
    this.append(this._switch())
  }

  attachListeners() {
    this.input.addEventListener('change', () => {
      this.updateSetting(this.dataset.valueKey, this.input.checked)
    })
  }

  updateValue(newValue) {
    this.querySelector('input').setAttribute('checked', newValue)
  }

  _switch() {
    let mdcSwitch = document.createElement('div')
    mdcSwitch.classList = 'mdc-switch'

    mdcSwitch.append(this._input())
    mdcSwitch.append(this._knob())

    return mdcSwitch
  }

  _input() {
    this.input = document.createElement('input')
    this.input.setAttribute('type', 'checkbox')
    this.input.setAttribute('id', this.dataset.id)
    this.input.setAttribute('class', 'mdc-switch__native-control')
    this.input.setAttribute('checked', nestedProperty.get(this.currentSettings(), this.dataset.valueKey))

    return this.input
  }

  _knob() {
    let background = document.createElement('div')
    background.classList = 'mdc-switch__background'
    let knob = document.createElement('div')
    knob.classList = 'mdc-switch__knob'

    background.append(knob)

    return background
  }

  _label() {
    let label = document.createElement('label')
    label.innerText = this.dataset.label
    label.classList = 'mdc-switch-label'
    label.style.flex = 1
    label.setAttribute('for', this.dataset.id)

    return label
  }
}

module.exports = SwitchField
window.customElements.define('switch-field', SwitchField)
