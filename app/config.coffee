CSON            = require 'season'
fs              = require 'fs'
{ homedir }     = require 'os'
{ join }        = require 'path'
{ Emitter }     = require 'event-kit'
{ remote, app } = require 'electron'
{ getValueAtKeyPath, setValueAtKeyPath, pushKeyPath } =
  require 'key-path-helpers'

Schema          = require './schema'
Coercer         = require './coercer'
VersionMigrator = require './version_migrator'

module.exports =
class Config
  filePath: join(homedir(), '.archipelago.json')
  schema: new Schema

  constructor: ->
    @emitter  = new Emitter

    if CSON.resolve(@filePath)?
      @_checkConfigVersion(CSON.readFileSync(@filePath) || {})
      @_refreshConfig(null, CSON.readFileSync(@filePath) || {})
    else
      @_refreshConfig(null, version: @currentVersion())

    @_bindWatcher()

  get: (keyPath, options) ->
    schema = @schema.getSchema(keyPath)
    return unless schema?

    profileKeyPath = "profiles.#{@activeProfileId}.#{keyPath}"
    if schema.platformSpecific?
      profileKeyPath = pushKeyPath(profileKeyPath, process.platform)

    value = getValueAtKeyPath(@contents, profileKeyPath)

    coercer = new Coercer(keyPath, value, schema, options)

    coercer.coerce()

  set: (keyPath, value) ->
    schema = @schema.getSchema(keyPath)
    return unless schema?
    keyPath = "profiles.#{@activeProfileId}.#{keyPath}"
    if schema.platformSpecific?
      keyPath = pushKeyPath(keyPath, process.platform)

    setValueAtKeyPath(@contents, keyPath, value)
    @_write(@contents)

  onDidChange: (keyPath, callback, options) ->
    oldValue = @get(keyPath)
    @emitter.on 'did-change', () =>
      newValue = @get(keyPath, options)
      unless oldValue == newValue
        oldValue = newValue
        callback(newValue)

  onActiveProfileChange: (callback) ->
    oldValue = @activeProfileId
    @emitter.on 'did-change', () =>
      newValue = @activeProfileId
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
    defaultValue = @schema.defaultValue('name')
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

  currentVersion: ->
    ((remote && remote.app) || app).getVersion()

  _refreshConfig: (error, newContents) ->
    return if error? || !newContents?

    @profiles = newContents.profiles || {}
    @profileIds = Object.keys(@profiles)
    @activeProfileId = newContents.activeProfileId
    @activeProfile = @profiles[@activeProfileId]
    @contents = newContents

    @validateActiveProfile()
    @emitter.emit('did-change')

  _bindWatcher: ->
    fsWait = false
    fs.watch @filePath, (event, filename) =>
      if filename && event is 'change'
        if fsWait
          return
        fsWait = setTimeout((() -> fsWait = false), 100)
        CSON.readFile(@filePath, @_refreshConfig.bind(this))

  _write: (contents) ->
    CSON.writeFile(@filePath, contents)

  _writeSync: (contents) ->
    CSON.writeFileSync(@filePath, contents)

  _checkConfigVersion: (contents) ->
    @contents = contents
    differentVersion =
      contents.version? && contents.version isnt @currentVersion()

    if differentVersion || !contents.version?
      migrator = new VersionMigrator(
        this, contents.version || '1.0.5', @currentVersion()
      )
      migrator.run()
