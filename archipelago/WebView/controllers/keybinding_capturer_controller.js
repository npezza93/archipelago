import { BridgeComponent } from "@hotwired/strada"
import formatKeybinding from '../format_keybinding'
import keystrokeForKeyboardEvent from '../keystroke_for_keyboard_event'

export default class extends BridgeComponent {
  static component = "keybinding-capturer"
  static targets = ['command', 'keystroke']
  static values = { index: Number }

  connect() {
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.keybindings = data.keybindings
    })
  }

  save() {
    this.keybindings[this.indexValue] = {
      keystroke: this.keystrokeTarget.getAttribute('value'),
      command: this.commandTarget.value,
    };
    this.send("change", { property: "keybindings", value: this.keybindings })
    this.element.close()
  }

  exit(event) {
    if (this.recording && this.keystrokeTarget != event.target) {
      this.keystrokeTarget.classList.remove('recording')
      this.keystrokeTarget.innerHTML = this.originalText
      this.recording = false
    }
  }

  startCapture() {
    this.originalText = this.keystrokeTarget.innerHTML;
    this.keystrokeTarget.innerHTML = 'Recording';
    this.keystrokeTarget.classList.add('recording');
    this.newKeystroke = null;
    this.recording = true
  }

  stop(event) {
    if (this.recording) {
      this.keystrokeTarget.classList.remove('recording');
      this.recording = false
    }
  }

  capture(event) {
    if (this.recording) {
      event.preventDefault();
      event.stopPropagation();
      const key = keystrokeForKeyboardEvent(event);

      if (this.newKeystroke !== key) {
        this.newKeystroke = key;
        this.keystrokeTarget.setAttribute('value', key);
        this.keystrokeTarget.innerHTML = formatKeybinding(key);
      }
    }
  }
}
