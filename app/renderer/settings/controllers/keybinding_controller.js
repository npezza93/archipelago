import { Controller } from 'stimulus'
import {ipcRenderer as ipc} from 'electron-better-ipc'

import formatAccelerator from '../../utils/format-accelerator'

export default class extends Controller {
  static values = { keystroke: String, command: String, index: Number }

  select(event) {
    document.querySelectorAll('#keybindings article > div').forEach(row => {
      row.classList.remove('active')
    })
    this.element.classList.add('active')
  }

  edit(event) {
    document.body.insertAdjacentHTML('beforeend', `<div class="backdrop" data-controller='keybinding-capturer' data-keybinding-capturer-index-value=${this.indexValue}>
      <div class='modal'>
        <div class='flex flex-col h-full w-full'>
          <div class='flex-1 flex flex-col w-full align-center gap-10 mt-15'>
            <div id='key-recorder' class='w-60p' value='${this.keystrokeValue}' data-keybinding-capturer-target='keystroke' data-action='click->keybinding-capturer#startCapture'>${formatAccelerator(this.keystrokeValue)}</div>
            <input type="text" name="command" value="${this.commandValue}" autofocus class='w-60p' data-keybinding-capturer-target='command'>
          </div>
          <div class='footer flex flex-row justify-end'>
            <button class='cancel' data-action='keybinding-capturer#close'>Cancel</button>
            <button class='ok' data-action='keybinding-capturer#save'>OK</button>
          </div>
        </div>
      </div>
    </div>`)
  }
}
