import Color from 'color'
import {getProperty} from 'dot-prop'
import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "color"

  connect() {
    // ipc.answerMain('active-profile-changed', this.setValue.bind(this));
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
    const alpha = this.currentColor.alpha();
    if (alpha < 1) {
      color = color.alpha(alpha);
    }
    this.currentColor = color

    this.send("change", { property: event.target.name, value: color.rgb().string() })
  }
}
