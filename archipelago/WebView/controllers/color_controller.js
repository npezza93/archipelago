import Color from 'color'
import {getProperty} from 'dot-prop'
import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "color"

  connect() {
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.currentColor = Color(getProperty(data, this.element.name))

      this.setValue()
    })
  }

  setValue() {
    this.element.value = this.currentColor.hex();
  }

  changed(event) {
    let color = Color(event.target.value);
    this.currentColor = color

    this.send("change", { property: event.target.name, value: color.rgb().string() })
  }
}
