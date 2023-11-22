import { loadBuffer } from "npezza93-font-ligatures"

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
        let font = window.fonts.find((font) => font.name == termFont) || window.font
        if (!font.ligatures) {
          const binaryString = atob(font.raw)
          let bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
          }

          font.ligatures = loadBuffer(bytes.buffer, { cacheSize: 100000 })
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
