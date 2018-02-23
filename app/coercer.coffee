{ pushKeyPath } = require 'key-path-helpers'
unescapeString  = require 'unescape-js'
Color           = require 'color'

module.exports =
class Coercer
  constructor: (keyPath, value, schema) ->
    @keyPath = keyPath
    @value = value
    @schema = schema
    @errors = []

  coerce: ->
    error = null
    types = @schema.type
    types = [types] unless Array.isArray(types)

    for type in types
      @value = this[type].call(this)

      if @errors.length > 0 then break

    if @errors.length > 0 then console.log @errors

    @value

  throwError: (comment) ->
    message = "Validation failed at #{@keyPath}, #{JSON.stringify(@value)}"
    if comment?
      message += " #{comment}"

    @errors.push(message)

  float: ->
    value = parseFloat(@value)
    if isNaN(value) or not isFinite(value)
      @throwError('cannot be coerced into a float')
    value

  integer: ->
    value = parseInt(@value)
    if isNaN(value) || !isFinite(value)
      @throwError('cannot be coerced into an int')
    else
      value

  boolean: ->
    errorMsg = "must be a boolean or the string 'true' or 'false'"
    switch typeof @value
      when 'string'
        if @value.toLowerCase() is 'true'
          true
        else if @value.toLowerCase() is 'false'
          false
        else
          @throwError(errorMsg)
      when 'boolean'
        @value
      else
        @throwError(errorMsg)

  string: ->
    value = if @value? then String(@value) else ''

    @throwError('must be a string') unless typeof value is 'string'

    value

  rawString: ->
    unescapeString(@string())

  object: ->
    return @value unless @schema.properties?

    defaultChildSchema = null
    newValue = {}
    for prop, propValue of @value
      childSchema = @schema.properties[prop]
      if childSchema?
        try
          propKeyPath = pushKeyPath(@keyPath, prop)
          coercer = new Coercer(propKeyPath, propValue, childSchema)
          newValue[prop] = coercer.coerce()
        catch error
          console.warn "Error setting item in object: #{error.message}"
      else
        console.warn "Illegal object key: #{@keyPath}.#{prop}"

    newValue

  array: ->
    @throwError('must be an array') unless Array.isArray(@value)

    itemSchema = @schema.items
    if itemSchema?
      newValue = []
      for item in @value
        try
          coercer = new Coercer(@keyPath, item, itemSchema)
          newValue.push coercer.coerce()
        catch error
          console.warn "Error setting item in array: #{error.message}"
      newValue
    else
      @value

  color: ->
    switch typeof @value
      when 'string'
        break
      when 'object'
        if (Array.isArray(@value)) then return null
        break
      else
        return null

    try
      parsedColor = new Color(@value)
      parsedColor.toString()
    catch error
      throwError('cannot be coerced into a color')
