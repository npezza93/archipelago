require('../../lib/array')
require('coffeescript').register()
KeymapManager = require('atom-keymap')
Config   = require('../config')

global.archipelago = { config: new Config, keymaps: new KeymapManager }

archipelago.keymaps.mappings = archipelago.config.get('keybindings')

require('./renderer')
