import fs from 'fs'
import chokidar from 'chokidar'
import { homedir } from 'os'
import { join } from 'path'
import { EventEmitter } from 'events'

const defaultProfile = require(join(__dirname, '/default_profile.json'))

class ConfigFile {
  constructor() {
    fs.open(this.filePath, 'r', (err) => {
      if (err) {
        let profile = { 'id': 1, 'name': 'New Profile' }
        Object.assign(profile, defaultProfile)
        profile = { "activeProfile": 1, "profiles": { 1: profile } }

        this.write(JSON.stringify(profile))
      }
    })

    this._emitter = new EventEmitter()
    this.bindWatcher()
  }

  get filePath() {
    return join(homedir(), '.archipelago.json')
  }

  get contents() {
    return JSON.parse(fs.readFileSync(this.filePath).toString())
  }

  get emitter() {
    return this._emitter
  }

  get activeSettings() {
    return this.contents.profiles[this.contents.activeProfile]
  }

  write(content) {
    fs.writeFileSync(this.filePath, content, (err) => {
      if (err) console.log(err)
    })
  }

  bindWatcher() {
    chokidar.watch(this.filePath).on('change', () => {
      this.emitter.emit('change')
    })
  }

  on(event, handler) {
    this.emitter.on('change', handler)
  }
}

module.exports = ConfigFile
