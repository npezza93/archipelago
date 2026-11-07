import { chromium, webkit } from 'playwright'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
import profile from './fixtures/profile'

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
    const scrolling = await page.evaluate(() => {
      const t = tc.terminal
      const wheel = (deltaY, deltaMode = 0, shiftKey = false) => {
        const before = messages.filter((m) => m.event === 'write').length
        t.element.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY,
            deltaMode,
            shiftKey,
            bubbles: true,
            cancelable: true,
          })
        )
        const writes = messages.filter((m) => m.event === 'write').slice(before)
        return {
          writes: writes.length,
          data: writes
            .map((m) => new TextDecoder().decode(new Uint8Array(m.data.bytes)))
            .join(''),
        }
      }
      // tmux requests mouse tracking; one terminal wheel report represents
      // one scroll step, so large deltas must produce multiple reports.
      t.write('\x1b[?1000h\x1b[?1006h')
      const pixels = wheel(t.cellHeight * 5)
      const up = wheel(-t.cellHeight * 3)
      const fractions = [
        wheel(t.cellHeight / 4),
        wheel(t.cellHeight / 4),
        wheel(t.cellHeight / 2),
      ]
      const lines = wheel(3, 1)
      const page = wheel(1, 2)
      const zero = wheel(0, 2)
      const shifted = wheel(3, 1, true)
      t.write('\x1b[?1000l\x1b[?1006l\x1b[?1049h\x1b[?1007h\x1b[?1h')
      const alternate = wheel(3, 1)
      t.write('\x1b[?1049l\x1b[?1007l\x1b[?1l')
      return {
        pixels,
        up,
        fractions,
        lines,
        page,
        zero,
        shifted,
        alternate,
        rows: t.vt.rows,
      }
    })
    assert.equal((scrolling.pixels.data.match(/\x1b\[<65;/g) || []).length, 5)
    assert.equal(
      scrolling.pixels.writes,
      1,
      'Batch wheel reports into one bridge write'
    )
    assert.equal((scrolling.up.data.match(/\x1b\[<64;/g) || []).length, 3)
    assert.deepEqual(
      scrolling.fractions.map((event) => event.writes),
      [0, 0, 1]
    )
    assert.equal((scrolling.lines.data.match(/\x1b\[<65;/g) || []).length, 3)
    assert.equal(
      (scrolling.page.data.match(/\x1b\[<65;/g) || []).length,
      scrolling.rows
    )
    assert.equal(scrolling.zero.writes, 0)
    assert.equal(
      scrolling.shifted.writes,
      0,
      'Shift-wheel bypasses application mouse reporting'
    )
    assert.equal(scrolling.alternate.data, '\x1bOB'.repeat(3))
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
    const optionBindings = await page.evaluate(() => {
      Strada.web.receive({
        id: 'settingChanged',
        data: {
          property: 'keybindings',
          value: {
            ...testProfile,
            macOptionIsMeta: false,
            keybindings: [
              ...testProfile.keybindings,
              { keystroke: 'alt-a', command: 'OptionA' },
              { keystroke: 'alt-e', command: 'OptionE' },
              { keystroke: 'alt-left', command: 'LeftWord' },
              { keystroke: 'alt-shift-right', command: 'SelectWord' },
            ],
          },
        },
      })
      const before = messages.filter((m) => m.event === 'write').length
      const prevented = [
        { key: 'å', code: 'KeyA' },
        { key: 'Dead', code: 'KeyE' },
        { key: 'ArrowLeft', code: 'ArrowLeft' },
        { key: 'ArrowRight', code: 'ArrowRight', shiftKey: true },
      ].map((key) => {
        const down = new KeyboardEvent('keydown', {
          ...key,
          altKey: true,
          bubbles: true,
          cancelable: true,
        })
        tc.terminal.textarea.dispatchEvent(down)
        tc.terminal.textarea.dispatchEvent(
          new KeyboardEvent('keyup', { ...key, bubbles: true })
        )
        return down.defaultPrevented
      })
      return {
        prevented,
        writes: messages
          .filter((m) => m.event === 'write')
          .slice(before)
          .map((m) => m.data.data),
      }
    })
    assert.deepEqual(optionBindings.prevented, [true, true, true, true])
    assert.deepEqual(optionBindings.writes, [
      'OptionA',
      'OptionE',
      'LeftWord',
      'SelectWord',
    ])
    const changedProfile = await page.evaluate(() => {
      Strada.web.receive({
        id: 'profileChanged',
        data: {
          ...testProfile,
          keybindings: [
            ...testProfile.keybindings,
            { keystroke: 'alt-a', command: 'ProfileA' },
          ],
        },
      })
      tc.terminal.textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'å',
          code: 'KeyA',
          altKey: true,
          bubbles: true,
          cancelable: true,
        })
      )
      tc.terminal.textarea.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'a', code: 'KeyA', bubbles: true })
      )
      const before = messages.filter((m) => m.event === 'write').length
      const unbound = new KeyboardEvent('keydown', {
        key: 'Dead',
        code: 'KeyE',
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
      tc.terminal.textarea.dispatchEvent(unbound)
      return {
        command: messages.filter((m) => m.event === 'write').at(-1).data.data,
        prevented: unbound.defaultPrevented,
        writes: messages.filter((m) => m.event === 'write').length - before,
      }
    })
    assert.deepEqual(changedProfile, {
      command: 'ProfileA',
      prevented: false,
      writes: 0,
    })
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
