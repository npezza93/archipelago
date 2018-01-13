require('coffeescript').register()
Config = require('../config')

global.archipelago = { config: new Config }
require('./settings')
