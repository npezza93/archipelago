const ConfigFile = require(join(__dirname, '/config_file'))
const defaultProfile = require(join(__dirname, '/default_profile.json'))

const TextField = require(join(__dirname, '/settings_fields/text_field'))
const ColorField = require(join(__dirname, '/settings_fields/color_field'))
const SelectField = require(join(__dirname, '/settings_fields/select_field'))
const SwitchField = require(join(__dirname, '/settings_fields/switch_field'))

class Profile {
  constructor(profile_values) {
    Object.assign(this, profile_values)
  }

  load() {
    document.querySelector('.profilesContainer .profiles').appendChild(new TextField('profile_' + this.id, 'profiles.' + this.id + '.name', 'Name', this.name))
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
