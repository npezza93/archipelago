CSON           = require 'season'
{ join }       = require 'path'
{ getValueAtKeyPath, splitKeyPath, pushKeyPath } = require 'key-path-helpers'

module.exports =
class Schema
  constructor: ->
    @schema =
      type: 'object'
      properties:
        CSON.readFileSync(join(__dirname, './schema.cson'))

  settingScopes: ->
    Object.keys(@bySettingScope())

  bySettingScope: ->
    scoped = {}

    @allSettings().forEach (setting) =>
      schema = getValueAtKeyPath(@raw, setting)
      scoped[schema.setting_scope] ?= []
      scoped[schema.setting_scope].push(setting)

    scoped

  editableSettings: ->
    editableSettings =
      for setting of @schema
        if @schema[setting].type == 'object'
          for property of @schema[setting].properties
            "#{setting}.#{property}"
        else
          setting

    editableSettings.flatten()

  getDefaultValue: (keyPath) ->
    schema = @getSchema(keyPath)

    if schema.default? && schema.platform_specific
      schema.default[process.platform]
    else if schema.default?
      schema.default
    else if schema.type == 'object' && schema.properties?
      defaults = {}
      for key of (schema.properties || {})
        defaults[key] = @getDefaultValue(pushKeyPath(keyPath, key))
      defaults

  getSchema: (keyPath) ->
    keys = splitKeyPath(keyPath)
    schema = @schema
    for key in keys
      if schema.type is 'object'
        childSchema = schema.properties?[key]
      schema = childSchema
    schema
