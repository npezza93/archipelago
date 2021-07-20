/* global describe, beforeEach, afterEach, it */

const path = require('path');
const {Application} = require('spectron');
const {assert} = require('chai');

let electron = './node_modules/electron/dist/';

electron = {
  darwin: electron + 'Electron.app/Contents/MacOS/Electron',
  linux: electron + 'electron',
  win32: electron,
}[process.platform];

describe('Settings', function () {
  this.timeout(10_000);

  beforeEach(() => {
    this.app = new Application({
      path: electron,
      verbose: true,
      env: {PAGE: 'settings'},
      args: [path.join(__dirname, '../../app/main/esm.js')],
    });
    this.app.args.unshift(path.join(__dirname, 'fake-menu-preload.js'));
    this.app.args.unshift('--require');
    return this.app.start();
  });

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('renders with no main process errors', () => this.app.client.getWindowCount().then(count => {
    assert.equal(count, 1);
  }));

  it('renders with no renderer process errors', () => this.app.client.getRenderProcessLogs().then(logs => {
    const filteredLogs = logs.filter(log => log.level === 'SEVERE');

    assert.isEmpty(filteredLogs, 'Exception in renderer process encountered');
  }));

  it('renders settings', async () => {
    const elements = await this.app.client.$$('body > section');
    assert.equal(elements.length, 5);
  });
});
