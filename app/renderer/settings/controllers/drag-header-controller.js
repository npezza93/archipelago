/* global document */

import {Controller} from '@hotwired/stimulus';
import mouseConstructor from 'osx-mouse';
import {getCurrentWindow} from '@electron/remote';

export default class extends Controller {
  connect() {
    this.mouse = mouseConstructor();
    this.offset = null;

    this.mouse.on('left-drag', (x, y) => {
      if (!this.offset) return;

      x = Math.round(x - this.offset[0]);
      y = Math.round(y - this.offset[1]);

      getCurrentWindow().setPosition(x + 0, y + 0);
    });

    this.mouse.on('left-up', () => {
      this.offset = null;
    });
  }

  dragging(e) {
    this.offset = [e.clientX, e.clientY];
  }
}
