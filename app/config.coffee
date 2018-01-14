CSON             = require 'season'
{ homedir }      = require 'os'
{ join }         = require 'path'
{ Emitter }      = require 'event-kit'
chokidar         = require 'chokidar'
nestedProperty   = require 'nested-property'

module.exports =
class Config
  constructor: ->
    @filePath = join(homedir(), '.archipelago.json')
    @emitter = new Emitter

    @_openFile()
    @_bindWatcher()

  get: (selector, activeProfile = true) ->
    selector = "profiles.#{@_activeProfileId()}.#{selector}" if activeProfile

    @_coerce(selector, nestedProperty.get(@_contents(), selector))

  set: (selector, value, activeProfile = true) ->
    selector = "profiles.#{@_activeProfileId()}.#{selector}" if activeProfile
    settings = @_contents()
    nestedProperty.set(settings, selector, value)
    @_write(settings)

  onDidChange: (selector, callback, activeProfile = true) ->
    oldValue = @get(selector, activeProfile)
    @emitter.on 'did-change', =>
      newValue = @get(selector, activeProfile)
      unless oldValue == newValue
        oldValue = newValue
        callback(newValue)

  defaultProfile: (id) ->
    profile = CSON.readFileSync(join(__dirname, './default_profile.cson'))
    profile.id = id

    profile

  getSchemaFor: (selector) ->
    nestedProperty.get(@_schema(), selector)

  _activeProfileId: ->
    @_contents().activeProfile

  _bindWatcher: ->
    chokidar.watch(@filePath).on 'change', () =>
      @emitter.emit('did-change')

  _coerce: (selector, value) ->
    schema = @getSchemaFor(selector)

    if schema && schema.type == 'integer'
      parseInt(value)
    else if schema && schema.type == 'float'
      parseFloat(value)
    else
      value

  _contents: ->
    CSON.readFileSync(@filePath)

  _exists: ->
    CSON.resolve(@filePath)?

  _openFile: ->
    if !@_exists() || Object.keys(@get('profiles', false)).length == 0
      @_write(activeProfile: 1, profiles: { 1: @defaultProfile(1) })

  _schema: ->
    @schema ?= CSON.readFileSync(join(__dirname, './schema.cson'))

  _write: (config) ->
    CSON.writeFile(@filePath, config)
