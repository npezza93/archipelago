{ pushKeyPath, getValueAtKeyPath } = require 'key-path-helpers'
unescapeString  = require 'unescape-js'
Color           = require 'color'

module.exports =
class Coercer
  constructor: (keyPath, value, defaultValue, schema) ->
    @keyPath = keyPath
    @value = value
    @defaultValue = defaultValue
    @schema = schema

  coerce: ->
    error = null
    types = @schema.type
    types = [types] unless Array.isArray(types)

    for type in types
      @value = this[type].call(this)

    @value

  float: ->
    value = parseFloat(@value || @defaultValue)

    if isNaN(value) or not isFinite(value)
      @_validationFailed('cannot be coerced into a float')
    else
      value

  integer: ->
    value = parseInt(@value || @defaultValue)

    if isNaN(value) or not isFinite(value)
      @_validationFailed('cannot be coerced into an int')
    else
      value

  boolean: ->
    errorMsg = "must be a boolean or the string 'true' or 'false'"
    value = @value || @defaultValue
    switch typeof value
      when 'string'
        if value.toLowerCase() is 'true'
          true
        else if value.toLowerCase() is 'false'
          false
        else
          @_validationFailed(errorMsg)
      when 'boolean'
        value
      else
        @_validationFailed(errorMsg)

  string: ->
    value = @value || @defaultValue
    value = if value? then String(value) else ''

    if typeof value is 'string'
      value
    else
      @_validationFailed('must be a string')

  rawString: ->
    unescapeString(@string())

  object: ->
    value = @value || @defaultValue

    return value unless @schema.properties?

    defaultChildSchema = null
    newValue = {}

    for property, propertySchema of @schema.properties
      if propertySchema?
        try
          propertyKeyPath = pushKeyPath(@keyPath, property)
          propertyValue = getValueAtKeyPath(value, property)
          coercer = new Coercer(
            propertyKeyPath,
            propertyValue,
            propertySchema.default,
            propertySchema
          )
          newValue[property] = coercer.coerce()
        catch error
          @_error 'Error setting item in object', error.message
      else
        @_error 'Illegal object key', "#{@keyPath}.#{property}"

    newValue

  array: ->
    value = @value || @defaultValue

    @_validationFailed('must be an array') unless Array.isArray(value)

    itemSchema = @schema.items
    if itemSchema?
      newValue = []
      for item in value
        try
          coercer = new Coercer(@keyPath, item, null, itemSchema)
          newValue.push coercer.coerce()
        catch error
          @_error 'Error setting item in array', error.message
      newValue
    else
      value

  color: ->
    value = @value || @defaultValue
    switch typeof value
      when 'string'
        break
      when 'object'
        if (Array.isArray(value)) then return null
        break
      else
        return null

    try
      parsedColor = new Color(value)
      parsedColor.toString()
    catch error
      @_validationFailed('cannot be coerced into a color')

  _validationFailed: (comment) ->
    title = "Validation failed at #{@keyPath}"
    body = JSON.stringify(@value)

    if comment? then body += " #{comment}"

    @_warning(title, body, 'warning')

  _error: (title, message) ->
    @_sendNotification(title, message, 'error')

  _warning: (title, message) ->
    @_sendNotification(title, message, 'warning')

  _sendNotification: (title, body, type) ->
    if typeof window.Notification isnt 'function'
      alert('This browser does not support desktop notification')
    else if Notification.permission is 'granted'
      new Notification(title, { body: body, icon: "../icons/#{type}.png" })
    else if Notification.permission isnt 'denied'
      Notification.requestPermission (permission) ->
        if permission is 'granted'
          new Notification(title, { body: body, icon: "../icons/#{type}.png" })
