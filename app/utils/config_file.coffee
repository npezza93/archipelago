fs               = require('fs')
chokidar         = require('chokidar')
{ homedir }      = require('os')
{ join }         = require('path')
{ EventEmitter } = require('events')
defaultProfile   = require('../settings/default_profile.json')

module.exports =
class ConfigFile
  constructor: ->
    fs.open @filePath(), 'r', (err) =>
      if err
        profile = { 'id': 1, 'name': 'New Profile' }
        Object.assign(profile, defaultProfile)
        profile = { 'activeProfile': 1, 'profiles': { 1: profile } }

        @write(JSON.stringify(profile))

    @emitter = new EventEmitter()
    @bindWatcher()

  filePath: ->
    join(homedir(), '.archipelago.json')

  contents: ->
    JSON.parse(fs.readFileSync(@filePath()).toString())

  activeSettings: ->
    @contents().profiles[@contents().activeProfile]

  write: (content) ->
    fs.writeFileSync @filePath(), content, (err) =>
      if err
        console.log(err)

  bindWatcher: ->
    chokidar.watch(@filePath()).on 'change', () =>
      @emitter.emit('change')

  on: (event, handler) ->
    @emitter.on('change', handler)
