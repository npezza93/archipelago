fs               = require('fs')
chokidar         = require('chokidar')
{ homedir }      = require('os')
{ join }         = require('path')
{ EventEmitter } = require('events')
nestedProperty   = require('nested-property')
defaultProfile   = require('../settings/default_profile.json')

module.exports =
class ConfigFile
  constructor: ->
    fs.open @filePath(), 'r', (err) =>
      if err
        @write({
          'activeProfile': 1, 'profiles': { 1: @constructor.defaultProfile(1) }
        })

    @emitter = new EventEmitter()
    @bindWatcher()

  filePath: ->
    join(homedir(), '.archipelago.json')

  contents: ->
    JSON.parse(fs.readFileSync(@filePath()).toString())

  activeSettings: ->
    @contents().profiles[@contents().activeProfile]

  update: (key, value) ->
    settings = @contents()
    nestedProperty.set(settings, key, value)
    @write(settings)

  write: (content) ->
    fs.writeFileSync @filePath(), JSON.stringify(content, null, 2), (err) =>
      if err
        console.log(err)

  bindWatcher: ->
    chokidar.watch(@filePath()).on 'change', () =>
      @emitter.emit('change')

  on: (event, handler) ->
    @emitter.on('change', handler)

  @defaultProfile: (id) ->
    profile = { 'id': id, 'name': 'New Profile' }
    Object.assign(profile, defaultProfile)

    profile
