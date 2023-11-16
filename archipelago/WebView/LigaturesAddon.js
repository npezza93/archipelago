import { loadBuffer } from "font-ligatures"

export default class {
  activate(terminal) {
    this._terminal = terminal;
    this.font = undefined;
    this.looking = false

    this._characterJoinerId = this.enable();
  }

  dispose() {
    if (this._characterJoinerId !== undefined) {
      this._terminal?.deregisterCharacterJoiner(this._characterJoinerId);
      this._characterJoinerId = undefined;
    }
  }

  enable() {
    return this._terminal.registerCharacterJoiner(text => {
      const termFont = this._terminal.options.fontFamily

      if (!this.looking && termFont && this.font?.name !== termFont) {
        this.looking = true
        let font = JSON.parse(window.fonts.find(font => JSON.parse(font).name == termFont))
        if (!font.ligatures) {
          let uint8Array = new Uint8Array(font.raw);
          font.ligatures = loadBuffer(uint8Array.buffer, { cacheSize: 100000 })
        }
        this.font = font
        this._terminal.refresh(0, this._terminal.rows - 1)
        this.looking = false
      }

      if (this.font) {
        return this.font.ligatures.findLigatureRanges(text).map(range => [range[0], range[1]])
      }
    })
  }
}
