import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "fonts"

  connect() {
    super.connect()
    this.send("connect", {}, ({data}) => {
      let options = '';
      data.fonts.sort().forEach(font => {
        font = font.replace(/"/g, '');
        options += `<option value="${font}">${font}</option>`;
      });
      this.element.querySelector('select').innerHTML = options;

      const currentValue = data.profile[this.element.querySelector('select').name];
      const element = this.element.querySelector(`option[value='${currentValue}']`);

      if (element) {
        element.selected = true;
      }
    })
  }
}
