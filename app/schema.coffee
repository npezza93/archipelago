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

  groupByScope: ->
    scopes = {}

    for property, schema of @editableProperties()
      for scopeKey, scope of schema.scopes
        scopes[scopeKey] ?= {}
        scopes[scopeKey][scope] ?= {}
        Object.assign(scopes[scopeKey][scope], { "#{property}": schema })

    scopes

  editableProperties: ->
    @getPropertyFromSchema('', @schema)

  getPropertyFromSchema: (keyPath, schema) ->
    if schema.type is 'object'
      properties = {}
      for childKeyPath, childSchema of (schema.properties || {})
        propertyKeyPath = pushKeyPath(keyPath, childKeyPath)
        childProperties = @getPropertyFromSchema(propertyKeyPath, childSchema)
        Object.assign(properties, childProperties)
      properties
    else
      { "#{keyPath}": schema }

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
