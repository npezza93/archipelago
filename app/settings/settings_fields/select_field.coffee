mdc            = require('material-components-web/dist/material-components-web')
BaseField      = require('./base_field')
nestedProperty = require('nested-property')

class SelectField extends BaseField
  constructor: (id, label) ->
    super()
    @dataset['id'] = @dataset.id || id
    @dataset['label'] = @dataset.label || label

  initializeMdcElement: ->
    @mdcSelect = mdc.select.MDCSelect.attachTo(@mdcElement)

  updateValue: (newValue) ->
    @mdcSelect.selectedIndex = @mdcSelect.options.findIndex (item) =>
      return item.id == newValue

  setInnerHTML: ->
    @mdcElement = document.createElement('div')
    @mdcElement.classList = 'mdc-select'
    @mdcElement.setAttribute('style', 'margin-top:15px;')
    @mdcElement.setAttribute('role', 'listbox')
    @mdcElement.setAttribute('tabindex', '0')

    @mdcElement.innerHTML = @label() + @menu()

    @append(@mdcElement)

  attachListeners: ->
    @mdcSelect.listen 'MDCSelect:change', () =>
      @updateSetting(@valueKey(), @mdcSelect.value)

  menu: ->
    menu = document.createElement('div')
    menu.classList = 'mdc-simple-menu mdc-select__menu'

    ul = document.createElement('ul')
    ul.classList = 'mdc-list mdc-simple-menu__items'
    ul.innerHTML = @menuItems()

    menu.append(ul)

    menu.outerHTML

  menuItems: ->
    menuItems = ''

    menuItems += @menuItem(@dataset.label, '', true)

    JSON.parse(@dataset.options).forEach (option) =>
      menuItems += @menuItem(option[1], option[0])

    menuItems

  menuItem: (text, id = '', disabled = false)  ->
    menuItem = document.createElement('li')
    menuItem.classList = 'mdc-list-item'
    menuItem.setAttribute('role', 'option')
    menuItem.setAttribute('tabindex', '0')
    menuItem.id = id if id?
    menuItem.setAttribute('aria-disabled', 'true') if disabled?
    menuItem.setAttribute('aria-selected',true) if id == @currentValue
    menuItem.innerText = text

    menuItem.outerHTML

  label: ->
    element = document.createElement('span')
    element.innerText = @dataset.label
    element.classList = 'mdc-select__selected-text'

    element.outerHTML

module.exports = SelectField
window.customElements.define('select-field', SelectField)
