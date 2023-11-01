import {Terminal} from 'xterm';
import unescape from 'unescape-js';
import debounce from '../debounce';
import Color from 'color';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import {WebglAddon} from 'xterm-addon-webgl';
import {CanvasAddon} from 'xterm-addon-canvas';
// import {LigaturesAddon} from 'xterm-addon-ligatures';
import bellSound from '../bell-sound';
import { BridgeComponent } from "@hotwired/strada"
import keystrokeForKeyboardEvent from '../keystroke_for_keyboard_event'

export default class extends BridgeComponent {
  static component = "terminal"

  initialize() {
    this.fit = debounce(this.fit.bind(this), 50)
  }

  connect() {
    super.connect()
    this.fitAddon = new FitAddon();
    this.webglAddon = new WebglAddon();
    this.canvasAddon = new CanvasAddon();
    this.send("connect", {}, ({data}) => {
      this.profile = data

      this.xterm = new Terminal(this.settings());
      window.xterm = this.xterm
      this.xterm.loadAddon(this.fitAddon);

      this.resetKeymaps();
      document.documentElement.style.setProperty("--background-color", this.profile.theme.background);
      document.documentElement.style.setProperty("--terminal-padding", this.profile.padding);

      this.attach()
    })

  }

  disconnect() {
    this.send("disconnect")
    super.disconnect()
    this.xterm?.dispose();
    this._wrapperElement?.remove();
    this._wrapperElement = null;
    this.xterm = null;
  }

  send(event, data = {}, callback) {
    data.metadata = { url: "archipelago-1" }

    const message = { component: this.component, event, data, callback }
    const messageId = this.bridge.send(message)
    if (callback) {
      this.pendingMessageCallbacks.push(messageId)
    }
  }

  attach() {
    // Attach has not occured yet
    if (!this._wrapperElement) {
      this._wrapperElement = document.createElement('div');
      this._wrapperElement.classList = 'wrapper';
      this._xtermElement = document.createElement('div');
      this._xtermElement.classList = 'wrapper';
      this._wrapperElement.append(this._xtermElement);
      this.element.append(this._wrapperElement);
      this.xterm.open(this._xtermElement);
      this.xterm.loadAddon(this.webglAddon);
      // this.xterm.loadAddon(this.canvasAddon);

      this.bindListeners();
      this.fit();
      this.xterm.focus();
      return;
    }

    this._wrapperElement.remove();
    this._container = this.element;
    this._container.append(this._wrapperElement);
    this.xterm.focus();
  }

  fit() {
    this.fitAddon.fit();
    this.send("resize", {cols: this.xterm.cols, rows: this.xterm.rows})
  }

  onBinary(callback) {
    return this.xterm.onBinary(callback);
  }

  onData(callback) {
    return this.xterm.onData(callback);
  }

  onBell(callback) {
    return this.xterm.onBell(callback);
  }

  onSelection(callback) {
    return this.xterm.onSelectionChange(callback);
  }

  copySelection() {
    if (this.profile.copyOnSelect && this.xterm.getSelection()) {
      navigator.clipboard.writeText(this.xterm.getSelection())
    }
  }

  settings() {
    return this.applySettingModifiers(
      this.xtermSettings().reduce((settings, property) => {
        settings[property] = this.profile[property];
        return settings;
      }, {}),
    );
  }

  xtermSettings() {
    return ['fontFamily', 'fontSize', 'fontWeight', 'cursorStyle',
      'cursorBlink', 'scrollback', 'macOptionIsMeta', 'hideContextMenu',
      'rightClickSelectsWord', 'macOptionClickForcesSelection', 'theme']
  }

  allowTransparency(background) {
    const color = new Color(background);
    let allowTransparency;

    allowTransparency = color.alpha() !== 1;

    return allowTransparency;
  }

  applySettingModifiers(defaultSettings) {
    const {background} = defaultSettings.theme;
    defaultSettings.allowTransparency = this.allowTransparency(background);
    defaultSettings.cursorWidth = 2;
    defaultSettings.fontWeightBold = 'bold';
    defaultSettings.lineHeight = 1;
    defaultSettings.letterSpacing = '0';
    defaultSettings.tabStopWidth = 8;
    defaultSettings.allowProposedApi = true;
    // defaultSettings.logLevel = 'debug'

    return defaultSettings;
  }

  get keymaps() {
    if (this._keymaps === undefined) {
      this.resetKeymaps();
    }

    return this._keymaps;
  }

  resetKeymaps() {
    this._keymaps = (this.profile.keybindings || []).reduce((result, item) => {
        result[item.keystroke] = unescape(item.command);
        return result;
      }, {});
  }

  keybindingHandler(event) {
    let caught = false;
    const mapping = this.keymaps[keystrokeForKeyboardEvent(event)];

    if (mapping) {
      this.send("write", { data: mapping })
      caught = true;
    }

    return !caught;
  }


  bindListeners() {
    const scrollbarFadeEffect = () => {
      clearTimeout(this.scrollbarFade);
      this.scrollbarFade = setTimeout(
        () => this.xterm.element.classList.remove('scrolling'),
        600,
      );
      this.xterm.element.classList.add('scrolling');
    };

    this.xterm.element.addEventListener('wheel', scrollbarFadeEffect.bind(this),
      {passive: true});

    this.webLinksAddon = new WebLinksAddon((event, uri) => {
      const anchor = document.createElement("a")
      anchor.href = uri
      anchor.target = "_blank"
      anchor.click()
    })
    this.xterm.loadAddon(this.webLinksAddon);
    this.xterm.attachCustomKeyEventHandler(this.keybindingHandler.bind(this));
    this.send("data", {}, ({data}) => this.xterm.write(JSON.parse(data.data)))
    this.onData(data => this.send("write", { data }))
    this.onBell(() => bellSound.play())
    this.onSelection(this.copySelection.bind(this))

    this.onBinary(data => {
      console.log('binary-send', {data})
      this.send("binary", {data})
    })
  }

}
