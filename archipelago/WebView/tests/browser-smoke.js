import { chromium, webkit } from 'playwright'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
const profile = {
  fontFamily: 'monospace',
  fontSize: 15,
  fontWeight: 'normal',
  cursorStyle: 'block',
  cursorBlink: false,
  scrollback: 4000,
  macOptionIsMeta: true,
  rightClickSelectsWord: true,
  macOptionClickForcesSelection: true,
  padding: '5px 0 10px 15px',
  copyOnSelect: false,
  hideContextMenu: true,
  ligatures: false,
  theme: {
    foreground: '#dddddd',
    background: '#202020',
    cursor: '#ffffff',
    cursorAccent: '#000000',
    selectionBackground: '#666666',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    yellow: '#ffff00',
    blue: '#0000ff',
    magenta: '#ff00ff',
    cyan: '#00ffff',
    white: '#ffffff',
    brightBlack: '#555555',
    brightRed: '#ff5555',
    brightGreen: '#55ff55',
    brightYellow: '#ffff55',
    brightBlue: '#5555ff',
    brightMagenta: '#ff55ff',
    brightCyan: '#55ffff',
    brightWhite: '#ffffff',
  },
  keybindings: [
    { keystroke: 'ctrl-k', command: '\\x0b' },
    { keystroke: 'cmd-j', command: '\\x01' },
  ],
}
;(async () => {
  const engineName = process.argv[2] || 'chromium'
  const engine = engineName === 'webkit' ? webkit : chromium
  const browser = await engine.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE,
  })
  try {
    const context = await browser.newContext({
      userAgent: 'Archipelago bridge-components: [terminal font-loader]',
      viewport: { width: 900, height: 600 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    page.setDefaultTimeout(10000)
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.addInitScript((profile) => {
      window.messages = []
      window.testProfile = profile
      document.addEventListener('web-bridge:ready', () => {
        window.Strada.web.setAdapter({
          platform: 'ios',
          supportedComponents: ['terminal', 'font-loader'],
          supportsComponent: () => true,
          receive(message) {
            window.messages.push(message)
            if (message.event === 'connect')
              setTimeout(
                () =>
                  window.Strada.web.receive({ id: message.id, data: profile }),
                0
              )
          },
        })
      })
    }, profile)
    await page.goto('file://' + root + '/index.html')
    await page.waitForSelector('canvas').catch(async (error) => {
      console.error('Frontend errors:', errors)
      console.error(
        await page.evaluate(() => ({
          body: document.body.innerText,
          messages: window.messages,
        }))
      )
      throw error
    })
    await page.waitForFunction(() =>
      window.messages.some((m) => m.event === 'data')
    )
    const state = await page.evaluate(() => {
      window.tc = window.Stimulus.getControllerForElementAndIdentifier(
        document.querySelector('.archipelago-terminal'),
        'terminal'
      )
      return {
        version: tc.terminal.vt.abi.library_version,
        events: messages.map((m) => m.event),
        size: messages.find((m) => m.event === 'data').data,
      }
    })
    assert.equal(state.version, '1.0.0')
    assert(state.size.cols > 50)
    assert(state.size.rows > 20)
    assert(
      !state.events.slice(0, state.events.indexOf('data')).includes('write')
    )
    await page.evaluate(() => {
      const bytes = new TextEncoder().encode(
        'Hello 👻\r\n\x1b[31mRed\x1b[0m\r\nhttps://example.com'
      )
      Strada.web.receive({
        id: 'data',
        data: { data: JSON.stringify(Array.from(bytes)) },
      })
    })
    await page.waitForFunction(() =>
      tc.terminal.lastFrame?.rows[0].some((c) => c.text === 'H')
    )
    const box = await page.locator('canvas').boundingBox()
    const metrics = await page.evaluate(() => ({
      width: tc.terminal.cellWidth,
      height: tc.terminal.cellHeight,
    }))
    await page.mouse.move(box.x + 1, box.y + metrics.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      box.x + metrics.width * 5 - 1,
      box.y + metrics.height / 2,
      { steps: 5 }
    )
    await page.mouse.up()
    assert.equal(
      await page.evaluate(() => tc.terminal.vt.selectionText()),
      'Hello'
    )
    await page.keyboard.type('echo hello')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Control+c')
    const data = await page.evaluate(() =>
      messages
        .filter((m) => m.event === 'write')
        .map((m) =>
          m.data.bytes
            ? new TextDecoder().decode(new Uint8Array(m.data.bytes))
            : m.data.data
        )
        .join('')
    )
    assert.equal(data, 'echo hello\r\x03')
    // Native Command shortcuts must retain their default action and never
    // reach the PTY, including keyup after Command itself has been released.
    const commandShortcuts = await page.evaluate(() => {
      tc.terminal.write('\x1b[>3u') // Enable Kitty release reports.
      const before = messages.filter((m) => m.event === 'write').length
      const shortcuts = [
        [',', 'Comma'],
        ['n', 'KeyN'],
        ['w', 'KeyW'],
        ['q', 'KeyQ'],
        ['c', 'KeyC'],
        ['v', 'KeyV'],
        ['x', 'KeyX'],
      ].map(([key, code]) => {
        const down = new KeyboardEvent('keydown', {
          key,
          code,
          metaKey: true,
          bubbles: true,
          cancelable: true,
        })
        const up = new KeyboardEvent('keyup', {
          key,
          code,
          metaKey: false,
          bubbles: true,
          cancelable: true,
        })
        tc.terminal.textarea.dispatchEvent(down)
        tc.terminal.textarea.dispatchEvent(up)
        return { key, prevented: down.defaultPrevented }
      })
      tc.terminal.write('\x1b[<u')
      return {
        shortcuts,
        writes: messages.filter((m) => m.event === 'write').length - before,
      }
    })
    assert(
      commandShortcuts.shortcuts.every(({ prevented }) => !prevented),
      JSON.stringify(commandShortcuts)
    )
    assert.equal(commandShortcuts.writes, 0)
    // Explicit profile keybindings continue to take precedence over defaults.
    const customCommand = await page.evaluate(() => {
      const before = messages.filter((m) => m.event === 'write').length
      const down = new KeyboardEvent('keydown', {
        key: 'j',
        code: 'KeyJ',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      })
      tc.terminal.textarea.dispatchEvent(down)
      tc.terminal.textarea.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'j', code: 'KeyJ', bubbles: true })
      )
      const writes = messages.filter((m) => m.event === 'write').slice(before)
      return {
        prevented: down.defaultPrevented,
        data: writes.map((m) => m.data.data),
      }
    })
    assert.equal(customCommand.prevented, true)
    assert.deepEqual(customCommand.data, ['\x01'])
    await page.keyboard.press('Control+k')
    assert.equal(
      await page.evaluate(
        () => messages.filter((m) => m.event === 'write').at(-1).data.data
      ),
      '\x0b'
    )
    await page.evaluate(() => {
      tc.terminal.write('\x1b[?2004h')
      const event = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: () => 'one\ntwo' },
      })
      tc.terminal.textarea.dispatchEvent(event)
    })
    assert.equal(
      await page.evaluate(() =>
        new TextDecoder().decode(
          new Uint8Array(
            messages.filter((m) => m.event === 'write').at(-1).data.bytes
          )
        )
      ),
      '\x1b[200~one\ntwo\x1b[201~'
    )
    await page.evaluate(() => {
      tc.terminal.textarea.value = '日本語'
      tc.terminal.textarea.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          data: '日本語',
          inputType: 'insertCompositionText',
        })
      )
    })
    assert.equal(
      await page.evaluate(() =>
        new TextDecoder().decode(
          new Uint8Array(
            messages.filter((m) => m.event === 'write').at(-1).data.bytes
          )
        )
      ),
      '日本語'
    )
    await page.evaluate(() =>
      Strada.web.receive({
        id: 'settingChanged',
        data: { property: 'fontSize', value: '19' },
      })
    )
    await page.waitForFunction(() => tc.terminal.settings.fontSize === 19)
    assert.equal(
      await page.evaluate(() =>
        tc.terminal.vt
          .frame(true)
          .rows[0].map((c) => c.text)
          .join('')
          .trim()
      ),
      'Hello 👻'
    )
    await page.evaluate(() =>
      Strada.web.receive({
        id: 'settingChanged',
        data: { property: 'cursorBlink', value: 'false' },
      })
    )
    assert.equal(
      await page.evaluate(() => tc.terminal.settings.cursorBlink),
      false
    )
    await page.evaluate(() => {
      const p = {
        ...testProfile,
        theme: {
          ...testProfile.theme,
          background: 'rgba(10, 20, 30, 0.5)',
          foreground: '#123456',
        },
        fontSize: 17,
      }
      Strada.web.receive({ id: 'profileChanged', data: p })
    })
    await page.waitForFunction(
      () => tc.terminal.lastFrame.colors.foreground.r === 18
    )
    assert.equal(
      await page.evaluate(() =>
        tc.terminal.vt
          .frame(true)
          .rows[0].map((c) => c.text)
          .join('')
          .trim()
      ),
      'Hello 👻'
    )
    await page.setViewportSize({ width: 1100, height: 750 })
    await page.waitForFunction(() => messages.some((m) => m.event === 'resize'))
    if (process.env.SCREENSHOT_PATH)
      await page.screenshot({ path: process.env.SCREENSHOT_PATH })
    await page.evaluate(() => {
      document.querySelector('.archipelago-terminal').remove()
    })
    await page.waitForFunction(() =>
      messages.some((m) => m.event === 'disconnect')
    )
    assert.deepEqual(errors, [])
    console.log(
      engineName,
      'file:// app bundle smoke test passed',
      state.size.cols + 'x' + state.size.rows
    )
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
