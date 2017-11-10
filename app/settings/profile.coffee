require('../utils/attr')

ConfigFile = require('../utils/config_file')
ProfileSelectorField = require('./settings_fields/profile_selector_field')
TextField = require('./settings_fields/text_field')
defaultProfile = require('./default_profile.json')

module.exports =
class Profile
  @attr 'nameField',
    get: ->
      return @_nameField if @_nameField

      @_nameField = new TextField('profiles.' + @id + '.name', 'Name')
      @_nameField.profileField = true

      @_nameField

  @attr 'selectorField',
    get: ->
      return @_selectorField if @_selectorField

      @_selectorField = new ProfileSelectorField(@id)
      @_selectorField.profile = this

      @_selectorField

  @attr 'nameSelectorContainer',
    get: ->
      return @_nameSelectorContainer if @_nameSelectorContainer

      @_nameSelectorContainer = document.createElement('div')
      @_nameSelectorContainer.classList = 'd-flex flex-row align-items-end'
      @_nameSelectorContainer.append(@selectorField)
      @_nameSelectorContainer.append(@nameField)

      @_nameSelectorContainer

  constructor: (profile_values) ->
    Object.assign(this, profile_values)

  load: ->
    document.querySelector('.profilesContainer .profiles').appendChild(@nameSelectorContainer)
    @loadSettings()

  loadSettings: ->
    return if !@isActive()

    @settingsKeys().forEach (key) =>
      if key != 'theme'
        @loadSetting(key, @settings(key))
      else
        Object.keys(@settings('theme')).forEach (color) =>
          @loadSetting('theme.' + color, @settings('theme')[color])

  loadSetting: (settingKey, value) ->
    element = document.querySelector('[data-id="' + settingKey + '"]')

    element.updateValue(value) if element?

  settingsKeys: ->
    Object.keys(@settings()).filter (setting) =>
      return setting != 'id' && setting != 'name'

  isActive: ->
    (new ConfigFile()).contents().activeProfile == @id

  settings: (key) ->
    settings = (new ConfigFile()).contents().profiles[@id]

    if key
      settings[key]
    else
      settings

  @create: ->
    configFile = new ConfigFile()
    contents = configFile.contents()
    id = Object.keys(contents.profiles || {}).length + 1

    contents.profiles = contents.profiles || {}
    contents.profiles[id] = { 'id': id, 'name': 'New Profile' }
    Object.assign(contents.profiles[id], defaultProfile)
    contents.activeProfile = id
    configFile.write(contents)

    (new Profile(contents.profiles[id])).load()

  @loadAll: ->
    configFile = new ConfigFile()
    contents   = configFile.contents()

    if contents.profiles?
      Object.values(contents.profiles).forEach (profile) =>
        (new Profile(profile)).load()
    else
      Profile.create()
