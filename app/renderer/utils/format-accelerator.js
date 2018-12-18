import {platform} from 'electron-util'

const MODIFIERS = {
  command: '\u2318',
  cmd: '\u2318',
  commandorcontrol: platform({macos: '\u2318', default: '\u2303'}),
  cmdorctrl: platform({macos: '\u2318', default: '\u2303'}),
  super: '\u2318',
  control: '\u2303',
  ctrl: '\u2303',
  shift: '\u21E7',
  alt: '\u2325',
  plus: '='
}

export default accelerator => {
  return (accelerator || '').split('-').map(key => {
    return MODIFIERS[key.toLowerCase()] || key
  }).join('+')
}
