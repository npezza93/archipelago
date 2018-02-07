require('coffeescript').register()
const KeymapManager = require('atom-keymap')
const Config   = require('../config')
const { Emitter, CompositeDisposable } = require('event-kit');

global.archipelago = {
  config: new Config,
  keymaps: new KeymapManager,
  subscriptions: new CompositeDisposable,
  emit: function(eventName, value) {
    return this._emitter.emit(eventName, value)
  },
  onDidChangeTitle: function(callback) {
    return this._emitter.on('did-change-title', callback)
  },
  _emitter: new Emitter
}

archipelago.keymaps.mappings = Object.values(
  archipelago.config.get('keybindings')[process.platform]
).map((keybinding) => {
  return {
    'keystroke': keybinding.accelerator,
    'command': keybinding.command.map((num) => {
      return String.fromCharCode(parseInt(num))
    }).join('')
  }
})

require('./renderer')
