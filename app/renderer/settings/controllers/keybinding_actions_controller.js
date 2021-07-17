import { Controller } from 'stimulus'
import KeybindingController from './keybinding_controller'
import {ipcRenderer as ipc} from 'electron-better-ipc'

export default class extends Controller {
  create() {
    let currentBindings = currentProfile.get('keybindings')
    const capturer = new KeybindingController
    capturer.indexValue = currentBindings.length

    capturer.edit()
  }

  destroy() {
    let currentBindings = currentProfile.get('keybindings')
    const activeItem = document.querySelector('[data-controller="keybinding"].active')

    if (activeItem) {
      delete currentBindings[activeItem.dataset.keybindingIndexValue]
      currentBindings = currentBindings.filter(item => item)
      ipc.callMain('change-setting', {property: 'keybindings', value: currentBindings})
    }
  }
}
