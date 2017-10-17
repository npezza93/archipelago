const { join } = require('path')
const ConfigFile = require(join(__dirname, '/js/config_file'))
const Profile = require(join(__dirname, '/js/profile'))

const configFile = new ConfigFile()

document.addEventListener('DOMContentLoaded', () => {
  let settings = configFile.contents

  document.documentElement.style.setProperty('--font-family', settings.fontFamily)
  document.documentElement.style.setProperty('--font-size', settings.fontSize + 'px')

  document.querySelector('form #cursorBlink').checked = settings.cursorBlink

  jsColorPicker('.theme input[type="text"]', {
    customBG: '#fff',
    init: function(elm, colors) {
      elm.style.backgroundColor = elm.value
      elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd'
    },
    actionCallback: function(e, action) {
      if (action === 'changeXYValue' || action === 'changeOpacityValue') {
        this.input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  })

  document.querySelector('.newProfile').addEventListener('click', () => {
    Profile.create()
  })

  Profile.loadAll()
})

configFile.on('change', () => {
  let element = document.documentElement

  element.style.setProperty('--font-family', configFile.contents.fontFamily)
  element.style.setProperty('--font-size', configFile.contents.fontSize + 'px')
})

document.querySelector('#cursorBlink').addEventListener('change', () => {
  updateSetting('cursorBlink', document.querySelector('#cursorBlink').checked)
})

function updateSetting(key, value) {
  let currentSettings = configFile.contents

  currentSettings[key] = value

  configFile.write(JSON.stringify(currentSettings))
}
