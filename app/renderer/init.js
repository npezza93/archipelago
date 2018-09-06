require('coffeescript').register()
KeymapManager = require('atom-keymap')

global.archipelago = { ...require('../configuration/global'), keymaps: new KeymapManager }

archipelago.keymaps.mappings = archipelago.config.get('keybindings')

require('./renderer')
