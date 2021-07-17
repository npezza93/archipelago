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

describe('Application launch', function () {
  this.timeout(20_000);

  beforeEach(() => {
    this.app = new Application({
      path: electron,
      verbose: true,
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

  it('renders the app', async () => {
    const element = await this.app.client.$('archipelago-app');
    assert.isTrue(await element.isExisting());
  });

  it('renders with no renderer process errors', () => this.app.client.getRenderProcessLogs().then(logs => {
    const filteredLogs = logs.filter(log => log.level === 'SEVERE');

    assert.isEmpty(filteredLogs, 'Exception in renderer process encountered');
  }));
});
