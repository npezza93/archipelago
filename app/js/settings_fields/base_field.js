const { join } = require('path')

const ConfigFile = require(join(__dirname, '../config_file'))
const nestedProperty = require('nested-property')

class BaseField extends HTMLElement {
  connectedCallback() {
    if (!this.innerHTML) {
      this.setInnerHTML()
    }

    this.initializeMdcElement()

    this.attachListeners()
  }

  initializeMdcElement() {}

  attachListeners() {}

  activeProfile() {
    return this.currentSettings().activeProfile
  }

  get configFile() {
    if (this._configFile) return this._configFile

    this._configFile = new ConfigFile()

    return this._configFile
  }

  currentSettings () {
    return this.configFile.contents()
  }

  updateSetting(valueKey, value) {
    let configContents = this.currentSettings()
    nestedProperty.set(configContents, valueKey, value)
    this.configFile.write(JSON.stringify(configContents))
  }

  get valueKey() {
    let valueKey
    if (!this.profileField) {
      valueKey = 'profiles.' + this.activeProfile() + '.'
    } else {
      valueKey = ''
    }

    return valueKey + this.dataset.id
  }

  get currentValue() {
    return nestedProperty.get(this.currentSettings(), this.valueKey) || ''
  }

  get profileField() {
    return this._profileField
  }

  set profileField(isProfileField) {
    return this._profileField = isProfileField
  }
}

module.exports = BaseField
