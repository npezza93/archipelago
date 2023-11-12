import {Controller} from '@hotwired/stimulus'
import formatKeybinding from '../format_keybinding'

export default class extends Controller {
  static values = { keystroke: String, command: String, index: Number }

  select() {
    document.querySelectorAll('#keybindings article > div').forEach(row => {
      row.classList.remove('active');
    });
    this.element.classList.add('active');
  }

  edit() {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog data-controller='modal keybinding-capturer' data-action="click@document->keybinding-capturer#exit close->modal#close" data-keybinding-capturer-index-value=${this.indexValue}>
        <div class='flex flex-col h-full w-full'>
          <div class='flex-1 flex flex-col w-full align-center gap-10 mt-15'>
            <div id='key-recorder' class='w-60p' value='${this.keystrokeValue}' data-keybinding-capturer-target='keystroke' data-action='click->keybinding-capturer#startCapture keydown@document->keybinding-capturer#capture keyup@document->keybinding-capturer#stop'>${formatKeybinding(this.keystrokeValue) || 'Click to set'}</div>
            <input type="text" name="command" value="${this.commandValue || ''}" autofocus class='w-60p' data-keybinding-capturer-target='command'>
          </div>
          <div class='footer flex flex-row justify-end'>
            <button class='cancel' data-action='modal#close'>Cancel</button>
            <button class='ok' data-action='keybinding-capturer#save'>OK</button>
          </div>
        </div>
      </dialog>`);
  }
}
