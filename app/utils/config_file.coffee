fs               = require('fs')
chokidar         = require('chokidar')
{ homedir }      = require('os')
{ join }         = require('path')
{ EventEmitter } = require('events')
defaultProfile   = require('../settings/default_profile.json')
darwinMappings   = require('../keymaps/darwin')
linuxMappings    = require('../keymaps/linux')
win32Mappings    = require('../keymaps/win32')

module.exports =
class ConfigFile
  constructor: ->
    fs.open @filePath(), 'r', (err) =>
      if err
        @write({
          'activeProfile': 1, 'profiles': @constructor.defaultProfile(1)
        })

    @emitter = new EventEmitter()
    @bindWatcher()

  filePath: ->
    join(homedir(), '.archipelago.json')

  contents: ->
    JSON.parse(fs.readFileSync(@filePath()).toString())

  activeSettings: ->
    @contents().profiles[@contents().activeProfile]

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
    profile = {
      'id': id,
      'name': 'New Profile',
      'keyboard': {
        'linux': linuxMappings,
        'win32': win32Mappings,
        'darwin': darwinMappings
      }
    }
    Object.assign(profile, defaultProfile)

    profile
