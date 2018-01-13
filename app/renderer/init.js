require('coffeescript').register()
KeymapManager = require('atom-keymap')
Config   = require('../config')

global.archipelago = { config: new Config, keymaps: new KeymapManager }

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
