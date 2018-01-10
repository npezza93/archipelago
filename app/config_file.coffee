CSON             = require 'season'
{ homedir }      = require 'os'
{ join }         = require 'path'
{ EventEmitter } = require 'events'
chokidar         = require 'chokidar'
nestedProperty   = require 'nested-property'

module.exports =
class ConfigFile
  constructor: ->
    @filePath = join(homedir(), '.archipelago.json')
    @emitter = new EventEmitter()
    @emitter.setMaxListeners(100)

    @_openFile()
    @_bindWatcher()

  get: (selector, activeProfile = true) ->
    selector = "profiles.#{@_activeProfileId()}.#{selector}" if activeProfile

    nestedProperty.get(@_contents(), selector)

  set: (selector, value, activeProfile = true) ->
    selector = "profiles.#{@_activeProfileId()}.#{selector}" if activeProfile
    settings = @_contents()
    nestedProperty.set(settings, selector, value)
    @_write(settings)

  onDidChange: (selector, callback) ->
    oldValue = @get(selector)
    @emitter.on 'did-change', =>
      newValue = @get(selector)
      unless oldValue == newValue
        oldValue = newValue
        callback(newValue)

  defaultProfile: (id) ->
    profile = CSON.readFileSync(join(__dirname, './default_profile.cson'))
    profile.id = id

    profile

  _activeProfileId: ->
    @_contents().activeProfile

  _bindWatcher: ->
    chokidar.watch(@filePath).on 'change', () =>
      @emitter.emit('did-change')

  _contents: ->
    CSON.readFileSync(@filePath)

  _exists: ->
    CSON.resolve(@filePath)?

  _openFile: ->
    if !@_exists() || Object.keys(@get('profiles', false)).length == 0
      @_write(activeProfile: 1, profiles: { 1: @defaultProfile(1) })

  _write: (config) ->
    CSON.writeFile(@filePath, config)
