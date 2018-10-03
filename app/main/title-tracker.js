const {
  Terminal: Xterm,
} = require('xterm');

module.exports = class TitleTracker {
  constructor(pty) {
    this.pty = pty;
    this.xterm = new Xterm();
    this.title = '';
    this.xtermWriter = data => this.xterm.write(data);
    this.titleListener = this.xterm.addDisposableListener('title', (newTitle) => {
      this.title = newTitle;
    });
    this.pty.onData(this.xtermWriter);
  }

  dispose() {
    this.pty.pty.removeListener('data', this.xtermWriter);
    delete this.xtermWriter;
    this.titleListener.dispose();
    delete this.titleListener;
    this.xterm.dispose();
    delete this.xterm;
  }
};
