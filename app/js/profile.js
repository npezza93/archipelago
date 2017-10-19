const ConfigFile = require(join(__dirname, '/config_file'))
const defaultProfile = require(join(__dirname, '/default_profile.json'))

const TextField = require(join(__dirname, '/settings_fields/text_field'))
const ColorField = require(join(__dirname, '/settings_fields/color_field'))
const SelectField = require(join(__dirname, '/settings_fields/select_field'))
const SwitchField = require(join(__dirname, '/settings_fields/switch_field'))
const ProfileSelectorField = require(join(__dirname, '/settings_fields/profile_selector_field'))

class Profile {
  constructor(profile_values) {
    Object.assign(this, profile_values)
  }

  load() {
    document.querySelector('.profilesContainer .profiles').appendChild(this.nameSelectorContainer)
    this.loadSettings()
  }

  loadSettings() {
    // console.log('loading settings')
  }

  get colors() {
    return [
      'foreground', 'background', 'cursor', 'cursorAccent', 'selection', 'red',
      'brightRed', 'green', 'brightGreen', 'yellow', 'brightYellow', 'magenta',
      'brightMagenta', 'cyan', 'brightCyan', 'blue', 'brightBlue', 'white',
      'brightWhite', 'black', 'brightBlack'
    ]
  }

  get nameField() {
    if (this._nameField) return this._nameField

    this._nameField = new TextField('profile_' + this.id, 'profiles.' + this.id + '.name', 'Name', this.name)

    return this._nameField
  }

  get selectorField() {
    if (this._selectorField) return this._selectorField

    this._selectorField = new ProfileSelectorField(this.id)

    return this._selectorField
  }

  get nameSelectorContainer() {
    if (this._nameSelectorContainer) return this._nameSelectorContainer

    this._nameSelectorContainer = document.createElement('div')
    this._nameSelectorContainer.classList = 'd-flex flex-row align-items-end'
    this._nameSelectorContainer.append(this.selectorField)
    this._nameSelectorContainer.append(this.nameField)

    return this._nameSelectorContainer
  }

  static create() {
    let configFile = new ConfigFile()
    let contents = configFile.contents
    let id = Object.keys(contents.profiles || {}).length + 1

    contents.profiles = contents.profiles || {}
    contents.profiles[id] = { 'id': id, 'name': 'New Profile' }
    Object.assign(contents.profiles[id], defaultProfile)
    contents.activeProfile = id
    configFile.write(JSON.stringify(contents))
    let profile = new Profile(contents.profiles[id])

    profile.load()
  }

  static loadAll() {
    let configFile = new ConfigFile()
    let contents = configFile.contents

    Object.values(contents.profiles || []).forEach((profile) => {
      (new Profile(profile)).load()
    })
  }
}

module.exports = Profile
