require('coffeescript').register()
ConfigFile   = require('../config_file')

global.archipelago = { config: new ConfigFile() }

require('./renderer')
