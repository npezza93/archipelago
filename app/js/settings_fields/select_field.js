const { join } = require('path')

const BaseField = require(join(__dirname, '/base_field'))
const nestedProperty = require('nested-property')

class SelectField extends BaseField {
  constructor(id, label) {
    super()
    this.dataset['id'] = this.dataset.id || id
    this.dataset['label'] = this.dataset.label || label
  }

  initializeMdcElement() {
    this.mdcSelect = mdc.select.MDCSelect.attachTo(this.mdcElement)
  }

  updateValue(newValue) {
    this.mdcSelect.selectedIndex = this.mdcSelect.options.findIndex((item) => {
      return item.id === newValue
    })
  }

  setInnerHTML() {
    this.mdcElement = document.createElement('div')
    this.mdcElement.classList = 'mdc-select'
    this.mdcElement.setAttribute('style', 'margin-top:15px;')
    this.mdcElement.setAttribute('role', 'listbox')
    this.mdcElement.setAttribute('tabindex', '0')

    this.mdcElement.innerHTML = this._label() + this._menu()

    this.append(this.mdcElement)
  }

  attachListeners() {
    this.mdcSelect.listen('MDCSelect:change', () => {
      this.updateSetting(this.valueKey, this.mdcSelect.value)
    });
  }

  _menu() {
    let menu = document.createElement('div')
    menu.classList = 'mdc-simple-menu mdc-select__menu'

    let ul = document.createElement('ul')
    ul.classList = 'mdc-list mdc-simple-menu__items'
    ul.innerHTML = this._menuItems()

    menu.append(ul)

    return menu.outerHTML
  }

  _menuItems() {
    let menuItems = ''

    menuItems += this._menuItem(this.dataset.label, '', true)
    JSON.parse(this.dataset.options).forEach((option) => {
      menuItems += this._menuItem(option[1], option[0])
    })

    return menuItems
  }

  _menuItem(text, id = '', disabled = false) {
    let menuItem = document.createElement('li')
    menuItem.classList = 'mdc-list-item'
    menuItem.setAttribute('role', 'option')
    menuItem.setAttribute('tabindex', '0')
    if (id) menuItem.id = id
    if (disabled) menuItem.setAttribute('aria-disabled', 'true')
    if (id == this.currentValue) menuItem.setAttribute('aria-selected',true)
    menuItem.innerText = text

    return menuItem.outerHTML
  }

  _label() {
    let element = document.createElement('span')
    element.innerText = this.dataset.label
    element.classList = 'mdc-select__selected-text'

    return element.outerHTML
  }
}

module.exports = SelectField
window.customElements.define('select-field', SelectField)
