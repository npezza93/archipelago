const { join } = require('path')
const ConfigFile = require(join(__dirname, '/js/config_file'))

const fields = ['fontFamily', 'fontSize', 'scrollback', 'bellStyle', 'cursorStyle', 'vibrancy']
const colors = ['foreground', 'background', 'cursor', 'cursorAccent', 'selection', 'red', 'brightRed', 'green', 'brightGreen', 'yellow', 'brightYellow', 'magenta', 'brightMagenta', 'cyan', 'brightCyan', 'blue', 'brightBlue', 'white', 'brightWhite', 'black', 'brightBlack']
const configFile = new ConfigFile()

document.addEventListener('DOMContentLoaded', () => {
  let settings = configFile.contents

  fields.forEach((field) => {
    document.querySelector('#' + field).value = settings[field]
  })
  colors.forEach((color) => {
    if (settings['theme'][color]) {
      document.querySelector('#' + color).value = settings['theme'][color]
    }
  })
  document.documentElement.style.setProperty('--font-family', settings.fontFamily)
  document.documentElement.style.setProperty('--font-size', settings.fontSize)

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
})

configFile.on('change', () => {
  let element = document.documentElement

  element.style.setProperty('--font-family', configFile.contents.fontFamily)
  element.style.setProperty('--font-size', configFile.contents.fontSize + 'px')
})

fields.forEach((field) => {
  document.querySelector('#' + field).addEventListener('change', () => {
    updateSetting(field, document.querySelector('#' + field).value)
  })
})

colors.forEach((color) => {
  document.querySelector('#' + color).addEventListener('change', () => {
    console.log('triggered');
    updateTheme(color, document.querySelector('#' + color).value)
  })
})

document.querySelector('#cursorBlink').addEventListener('change', () => {
  updateSetting('cursorBlink', document.querySelector('#cursorBlink').checked)
})

function updateSetting(key, value) {
  let currentSettings = configFile.contents

  currentSettings[key] = value

  configFile.write(JSON.stringify(currentSettings))
}

function updateTheme(color, value) {
  let currentSettings = configFile.contents

  if (currentSettings['theme'] === undefined) {
    currentSettings['theme'] = {}
  }
  currentSettings['theme'][color] = value

  configFile.write(JSON.stringify(currentSettings))
}

document.querySelectorAll('.mdc-textfield').forEach((field) => {
  mdc.textfield.MDCTextfield.attachTo(field)
})
