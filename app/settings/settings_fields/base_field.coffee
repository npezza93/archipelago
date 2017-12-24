require('../../utils/attr')

ConfigFile     = require('../../utils/config_file')
nestedProperty = require('nested-property')

class BaseField extends HTMLElement
  @attr 'configFile',
    get: ->
      return @_configFile if @_configFile

      @_configFile = new ConfigFile()

  @attr 'currentValue',
    get: ->
      nestedProperty.get(@currentSettings(), @valueKey()) || ''

  @attr 'profileField',
    get: ->
      @_profileField
    set: (isProfileField) ->
      @_profileField = isProfileField

  connectedCallback: ->
    @setInnerHTML() unless @innerHTML

    @initializeMdcElement()

    @attachListeners()

  initializeMdcElement: ->

  attachListeners: ->

  activeProfile: ->
    @currentSettings().activeProfile

  currentSettings: ->
    @configFile.contents()

  updateSetting: (valueKey, value) ->
    configContents = @currentSettings()
    nestedProperty.set(configContents, valueKey, value)
    @configFile.write(configContents)

  valueKey: ->
    valueKey = null

    if @profileField?
      valueKey = ''
    else
      valueKey = 'profiles.' + @activeProfile() + '.'

    valueKey + @dataset.id

module.exports = BaseField
