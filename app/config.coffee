CSON           = require 'season'
{ homedir }    = require 'os'
{ join }       = require 'path'
{ Emitter }    = require 'event-kit'
chokidar       = require 'chokidar'
{ getValueAtKeyPath, setValueAtKeyPath } = require 'key-path-helpers'
Schema         = require './schema'
Coercer        = require './coercer'

module.exports =
class Config
  filePath: join(homedir(), '.archipelago.dev.json')
  schema: new Schema

  constructor: ->
    @emitter  = new Emitter

    if CSON.resolve(@filePath)?
      @_refreshConfig(null, CSON.readFileSync(@filePath))
    else
      @_refreshConfig(null, {})

    @_bindWatcher()

  get: (keyPath) ->
    schema = @schema.getSchema(keyPath)
    defaultValue = @schema.getDefaultValue(keyPath)
    value =
      getValueAtKeyPath(@contents, "profiles.#{@activeProfileId}.#{keyPath}")

    coercer = new Coercer(keyPath, value, defaultValue, schema)

    coercer.coerce()

  set: (keyPath, value) ->
    keyPath = "profiles.#{@activeProfileId}.#{keyPath}"
    setValueAtKeyPath(@contents, keyPath, value)
    @_write(@contents)

  onDidChange: (keyPath, callback) ->
    oldValue = @get(keyPath)
    @emitter.on 'did-change', () =>
      newValue = @get(keyPath)
      unless oldValue == newValue
        oldValue = newValue
        callback(newValue)

  on: (event, callback) ->
    @emitter.on(event, callback)

  setActiveProfileId: (id) ->
    @contents.activeProfileId = parseInt(id)

    @_write(@contents)

  setProfileName: (id, newName) ->
    @contents.profiles[id].name = newName

    @_write(@contents)

  getProfileName: (id) ->
    schema = @schema.getSchema('name')
    defaultValue = @schema.getDefaultValue('name')
    value = getValueAtKeyPath(@contents, "profiles.#{id}.name")

    (new Coercer('name', value, defaultValue, schema)).coerce()

  createProfile: ->
    id = Math.max(...@profileIds) + 1
    @contents.profiles[id] = { id: id }
    @contents.activeProfileId = id

    @_write(@contents)

    id

  destroyProfile: (id) ->
    delete @contents.profiles[id]

    @_write(@contents)

  validateActiveProfile: ->
    return if @activeProfileId? && @activeProfile?

    if Object.keys(@profiles)[0]?
      @setActiveProfileId(Object.keys(@profiles)[0])
    else
      @_write(activeProfileId: 1, profiles: { 1: { id: 1 } })

  settingScopes: ->
    @schema.settingScopes()

  fieldsInSettingScope: (scope) ->
    @schema.bySettingScope()[scope]

  _refreshConfig: (error, newContents) ->
    return if error?

    @profiles = newContents.profiles || {}
    @profileIds = Object.keys(@profiles)
    @activeProfileId = newContents.activeProfileId
    @activeProfile = @profiles[@activeProfileId]
    @contents = newContents

    @validateActiveProfile()
    @emitter.emit('did-change')

  _bindWatcher: ->
    chokidar.watch(@filePath).on 'change', () =>
      CSON.readFile(@filePath, @_refreshConfig.bind(this))

  _write: (contents) ->
    CSON.writeFile(@filePath, contents)
