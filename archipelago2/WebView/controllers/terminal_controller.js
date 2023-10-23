import {CompositeDisposable, Disposable} from 'event-kit';
import {Terminal} from 'xterm';
import unescape from 'unescape-js';
import Color from 'color';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import {WebglAddon} from 'xterm-addon-webgl';
// import {LigaturesAddon} from 'xterm-addon-ligatures';
import bellSound from '../bell-sound';
import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "terminal"

  connect() {
    super.connect()
    this.subscriptions = new CompositeDisposable();
    this.fitAddon = new FitAddon();
    this.webglAddon = new WebglAddon();
    this.xterm = new Terminal({});
    window.xterm = this.xterm
    this.xterm.loadAddon(this.fitAddon);

    document.documentElement.style.setProperty("--background-color", "black");

    this.attach()
    // this.bindListeners();
    this.send("connect", {}, ({data}) => {
      const binaryString = atob(data.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      this.xterm.write(bytes);
    })
    this.send("resize", {cols: this.xterm.cols, rows: this.xterm.rows})
  }

  disconnect() {
    this.send("disconnect")
    super.disconnect()
    this.subscriptions.dispose();
    this.xterm?.dispose();
    this._wrapperElement?.remove();
    this._wrapperElement = null;
    this.xterm = null;
  }

  send(event, data = {}, callback) {
    // Include the url with each message, so the native app can
    // ensure messages are delivered to the correct destination
    data.metadata = { url: "archipelago-1" }

    const message = { component: this.component, event, data, callback }
    const messageId = this.bridge.send(message)
    if (callback) {
      // Track messages that we have callbacks for so we can clean up when disconnected
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

      this.bindScrollListener();
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
  }

  onBinary(callback) {
    return this.xterm.onBinary(callback);
  }

  onData(callback) {
    return this.xterm.onData(callback);
  }

  bindScrollListener() {
    const scrollbarFadeEffect = () => {
      clearTimeout(this.scrollbarFade);
      this.scrollbarFade = setTimeout(
        () => this.xterm.element.classList.remove('scrolling'),
        600,
      );
      this.xterm.element.classList.add('scrolling');
    };

    this.xterm.element.addEventListener('wheel', scrollbarFadeEffect.bind(this), {passive: true});

    this.subscriptions.add(new Disposable(() => {
      this.xterm.element.removeEventListener('wheel', scrollbarFadeEffect.bind(this), {passive: true});
    }));
    this.subscriptions.add(this.onData(data => {
      this.send("write", { data })
    }));
    this.subscriptions.add(this.onBinary(data => {
      console.log('binary-send', {data})
      this.send("binary", {data})
    }));
  }

}
