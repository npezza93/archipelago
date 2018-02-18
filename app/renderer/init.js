require('coffeescript').register()
KeymapManager = require('atom-keymap')
Config   = require('../config')
unescapeString = require('unescape-js')

global.archipelago = { config: new Config, keymaps: new KeymapManager }

archipelago.keymaps.mappings = Object.values(
  archipelago.config.get('keybindings')[process.platform]
).map((keybinding) => {
  return {
    'keystroke': keybinding.accelerator,
    'command': unescapeString(keybinding.command)
  }
})

require('./renderer')
