export default class Session {
  constructor() {
    this.currentProfile = new CurrentProfile();
    this.id = Math.random();
    this.ptyId = ipc.callMain('pty-create', {sessionId: this.id, sessionWindowId: getCurrentWindow().id});

    this.bindListeners();
  }

  resetTheme() {
    this.xterm.options.allowTransparency = this.settings().allowTransparency;
    this.xterm.options.theme = this.settings().theme;
  }

  onExit(callback) {
    ipc.on(`pty-exit-${this.id}`, callback);
    return new Disposable(() => {
      ipc.removeListener(`pty-exit-${this.id}`, callback);
    });
  }

  onSettingChanged({property, value}) {
    if (this.currentProfile.xtermSettings.includes(property)) {
      this.xterm.options[property] = value;
    } else if (property === 'keybindings') {
      this.resetKeymaps();
    } else if (property.startsWith('theme.')) {
      this.resetTheme();
    }
  }

  onActiveProfileChange() {
    this.resetKeymaps();
    this.xterm.options.allowTransparency = this.settings().allowTransparency;
    for (const property in this.settings()) {
      this.xterm.options[property] = this.settings()[property];
    }
  }

  bindListeners() {
    this.subscriptions.add(new Disposable(ipc.answerMain('active-profile-changed', this.onActiveProfileChange.bind(this))));
    this.subscriptions.add(new Disposable(ipc.answerMain('setting-changed', this.onSettingChanged.bind(this))));
  }
}
