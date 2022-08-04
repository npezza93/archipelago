/* global describe, beforeEach, afterEach, it */

const path = require('path');
const {Application} = require('@npezza93/spectron');
const {assert} = require('chai');

let electron = './node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'

describe('About', function () {
  this.timeout(10_000);

  beforeEach(() => {
    this.app = new Application({
      path: electron,
      verbose: true,
      env: {PAGE: 'about'},
      args: [path.join(__dirname, '../../app/main/esm.js')],
    });
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

  it('displays the current app version', async () => {
    const currentVersion = await this.app.electron.ipc.callMain("version")
    const element = await this.app.client.$('#version');
    await element.waitForDisplayed();
    const text = await element.getText();

    assert.equal(text, `v${currentVersion}`);
  });
});
