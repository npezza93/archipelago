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

  get configFile() {
    if (this._configFile) return this._configFile

    this._configFile = new ConfigFile()

    return this._configFile
  }

  currentSettings () {
    return this.configFile.contents
  }

  updateSetting(valueKey, value) {
    let configContents = this.currentSettings()
    nestedProperty.set(configContents, valueKey, value)
    this.configFile.write(JSON.stringify(configContents))
  }
}

module.exports = BaseField
