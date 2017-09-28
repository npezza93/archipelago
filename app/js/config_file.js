'use strict'

const fs = require('fs')
const chokidar = require('chokidar')
const { homedir } = require('os')
const { join } = require('path')
const { EventEmitter } = require('events')

class ConfigFile {
  constructor() {
    fs.open(this.filePath, 'r', (err) => {
      if (err) this.write('{}')
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
};

module.exports = ConfigFile
