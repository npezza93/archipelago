CSON           = require 'season'
{ homedir }    = require 'os'
{ join }       = require 'path'
{ Emitter }    = require 'event-kit'
chokidar       = require 'chokidar'
{ getValueAtKeyPath, setValueAtKeyPath } = require 'key-path-helpers'

module.exports =
class Config
  filePath: join(homedir(), '.archipelago.dev.json')
  schema: CSON.readFileSync(join(__dirname, './schema.cson'))

  constructor: ->
    @emitter  = new Emitter

    if CSON.resolve(@filePath)?
      @_refreshConfig(null, CSON.readFileSync(@filePath))
    else
      @_refreshConfig(null, {})

    @_bindWatcher()

  get: (selector) ->
    profileSelector = "profiles.#{@activeProfileId}.#{selector}"
    schema = getValueAtKeyPath(@schema, selector)
    value = getValueAtKeyPath(@contents, profileSelector)

    return value unless schema?

    @_coerce(schema, selector, value)

  set: (selector, value) ->
    selector = "profiles.#{@activeProfileId}.#{selector}"
    setValueAtKeyPath(@contents, selector, value)
    @_write(@contents)

  onDidChange: (selector, callback) ->
    oldValue = @get(selector)
    @emitter.on 'did-change', () =>
      newValue = @get(selector)
      unless oldValue == newValue
        oldValue = newValue
        callback(newValue)

  setActiveProfileId: (id) ->
    @contents.activeProfileId = id

    @_write(@contents)

  _refreshConfig: (error, newContents) ->
    return if error?

    @profiles = newContents.profiles || {}
    @profileIds = Object.keys(@profiles)
    @activeProfileId = newContents.activeProfileId
    @activeProfile = @profiles[@activeProfileId]
    @contents = newContents

    @_validateActiveProfile()

  _validateActiveProfile: ->
    return if @activeProfileId? && @activeProfile?

    if Object.keys(@profiles)[0]?
      @setActiveProfileId(Object.keys(@profiles)[0])
    else
      @_write(activeProfileId: 1, profiles: { 1: { id: 1 } })

  _bindWatcher: ->
    chokidar.watch(@filePath).on 'change', () =>
      CSON.readFile(@filePath, @_refreshConfig.bind(this))

      @emitter.emit('did-change')

  _coerce: (schema, selector, value) ->
    value = schema.default unless value? || schema.type == 'object'

    if schema.type == 'object'
      @_fetchObjectSetting(schema, selector)
    else if schema.type == 'integer'
      parseInt(value)
    else if schema.type == 'float'
      parseFloat(value)
    else if schema.type == 'boolean'
      Boolean(value)
    else
      value

  _fetchObjectSetting: (schema, selector) ->
    setting = {}

    Object.keys(schema).forEach (key) =>
      unless ['type', 'label', 'input', 'default'].includes(key)
        setting[key] = @get("#{selector}.#{key}")

    setting

  _write: (contents) ->
    CSON.writeFile(@filePath, contents)
