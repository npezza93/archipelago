require('coffeescript').register()
KeymapManager = require('atom-keymap')

global.archipelago = { ...require('../global'), keymaps: new KeymapManager }

archipelago.keymaps.mappings = archipelago.config.get('keybindings')

require('./renderer')
