import {platform} from 'electron-util'
import {accelerators} from '../utils'

export default {
  role: 'window',
  submenu: platform({
    macos: [
      {role: 'minimize', accelerator: accelerators.minimize},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ],
    default: [{role: 'minimize', accelerator: accelerators.minimize}]
  })
}
