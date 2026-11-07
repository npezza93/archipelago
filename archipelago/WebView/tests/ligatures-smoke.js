import { chromium, webkit } from 'playwright'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import profile from './fixtures/profile'

const engineName = process.argv[2] || 'chromium'
const engine = engineName === 'webkit' ? webkit : chromium
const font = {
  name: 'JetBrains Mono',
  raw: (
    await readFile(
      new URL('./fixtures/JetBrainsMono-Regular.ttf', import.meta.url)
    )
  ).toString('base64'),
}
const browser = await engine.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE,
})
try {
  const page = await browser.newPage({
    userAgent: 'Archipelago bridge-components: [terminal font-loader]',
    viewport: { width: 900, height: 600 },
    deviceScaleFactor: 2,
  })
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.addInitScript(
    ({ profile, font }) => {
      document.addEventListener('web-bridge:ready', () =>
        Strada.web.setAdapter({
          platform: 'ios',
          supportedComponents: ['terminal', 'font-loader'],
          supportsComponent: () => true,
          receive(message) {
            if (message.event === 'load')
              setTimeout(
                () => Strada.web.receive({ id: message.id, data: font }),
                0
              )
            if (message.event === 'connect')
              setTimeout(
                () =>
                  Strada.web.receive({
                    id: message.id,
                    data: {
                      ...profile,
                      fontFamily: font.name,
                      fontSize: 20,
                      ligatures: false, // Legacy profiles must no longer disable shaping.
                    },
                  }),
                0
              )
          },
        })
      )
    },
    { profile, font }
  )
  await page.goto(new URL('../index.html', import.meta.url).href)
  await page.waitForSelector('canvas')
  await page.waitForFunction(() =>
    [...document.fonts].some(
      (font) => font.family === 'JetBrains Mono' && font.status === 'loaded'
    )
  )
  await page.evaluate(() => {
    window.tc = Stimulus.getControllerForElementAndIdentifier(
      document.querySelector('.archipelago-terminal'),
      'terminal'
    )
    tc.terminal.write('\x1b[2J\x1b[H\x1b[?25l!= -> === !== => <= >= <=>')
  })
  await page.waitForFunction(
    () => tc.terminal.lastFrame?.rows[0][0].text === '!'
  )
  const pixels = (joined = true) =>
    page.evaluate((joined) => {
      const t = tc.terminal
      const text = '!= -> === !== => <= >= <=>'
      const reference = document.createElement('canvas')
      reference.width = t.canvas.width
      reference.height = Math.ceil(t.cellHeight * t.dpr)
      const ctx = reference.getContext('2d')
      ctx.setTransform(t.dpr, 0, 0, t.dpr, 0, 0)
      ctx.font = `${t.settings.fontWeight} ${t.settings.fontSize}px ${t.settings.fontFamily}`
      ctx.fillStyle = t.settings.theme.foreground
      ctx.textRendering = 'optimizeLegibility'
      if (joined) ctx.fillText(text, 0, t.baseline)
      else
        [...text].forEach((char, i) => {
          ctx.save()
          ctx.beginPath()
          ctx.rect(i * t.cellWidth, 0, t.cellWidth, t.cellHeight)
          ctx.clip()
          ctx.fillText(char, i * t.cellWidth, t.baseline)
          ctx.restore()
        })
      const expected = ctx.getImageData(
        0,
        0,
        reference.width,
        reference.height
      ).data
      const actual = t.context.getImageData(
        0,
        0,
        reference.width,
        reference.height
      ).data
      let differing = 0,
        hash = 0
      actual.forEach((value, i) => {
        if (value !== expected[i]) differing++
        hash = (hash * 31 + value) >>> 0
      })
      return {
        differing,
        hash,
        text: t.lastFrame.rows[0].map((cell) => cell.text).join(''),
      }
    }, joined)
  const enabled = await pixels()
  assert.equal(
    enabled.differing,
    0,
    'JetBrains Mono should render as a shaped text run'
  )
  // Do not rely on the engine's default shaping policy: WebKit versions and
  // inherited canvas styles can select the speed-oriented drawing path.
  await page.evaluate(() => {
    tc.terminal.context.textRendering = 'optimizeSpeed'
    tc.terminal.draw(tc.terminal.lastFrame)
  })
  assert.equal(
    (await pixels()).differing,
    0,
    'The renderer must explicitly enable ligature shaping'
  )
  const unshaped = await pixels(false)
  assert.notEqual(
    unshaped.differing,
    0,
    'Always-on rendering must differ from separate glyphs'
  )
  await page.evaluate(() => {
    const next = { ...tc.profile }
    delete next.ligatures
    Strada.web.receive({ id: 'profileChanged', data: next })
  })
  await page.waitForFunction(() => !tc.terminal.animationFrame)
  assert.equal(
    (await pixels()).hash,
    enabled.hash,
    'Profiles without the retired preference must retain ligatures'
  )
  // Resizing resets the canvas state; the loaded font and shaping must survive.
  await page.setViewportSize({ width: 1000, height: 650 })
  await page.waitForFunction(
    () =>
      tc.terminal.element.clientWidth > 950 &&
      tc.terminal.vt.cols ===
        Math.floor(
          (tc.terminal.element.clientWidth - 12) / tc.terminal.cellWidth
        ) &&
      !tc.terminal.animationFrame
  )
  assert.equal((await pixels()).differing, 0)
  await page.evaluate(() =>
    Strada.web.receive({
      id: 'settingChanged',
      data: { property: 'fontSize', value: '15' },
    })
  )
  await page.waitForFunction(
    () => tc.terminal.settings.fontSize === 15 && !tc.terminal.animationFrame
  )
  assert.equal(
    (await pixels()).differing,
    0,
    'Ligatures should render at the default font size too'
  )
  const loadedFaces = await page.evaluate(async (font) => {
    const loader = Stimulus.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller="font-loader"]'),
      'font-loader'
    )
    await Promise.all([loader.loadFont(font), loader.loadFont(font)])
    return [...document.fonts].filter(
      (face) => face.family === 'JetBrains Mono'
    ).length
  }, font)
  assert.equal(
    loadedFaces,
    1,
    'Repeated native font messages must reuse the loaded face'
  )
  await page.evaluate(() => {
    Strada.web.receive({
      id: 'settingChanged',
      data: { property: 'fontSize', value: '17' },
    })
    tc.terminal.write('\x1b[2J\x1b[H\x1b[7m' + ' '.repeat(20) + '\x1b[0m')
  })
  await page.waitForFunction(
    () => tc.terminal.settings.fontSize === 17 && !tc.terminal.animationFrame
  )
  const highlight = await page.evaluate(() => {
    const t = tc.terminal
    const pixels = t.context.getImageData(
      0,
      Math.floor((t.cellHeight * t.dpr) / 2),
      Math.floor(20 * t.cellWidth * t.dpr),
      1
    ).data
    let minimumAlpha = 255
    for (let i = 3; i < pixels.length; i += 4)
      minimumAlpha = Math.min(minimumAlpha, pixels[i])
    return { minimumAlpha, cellWidth: t.cellWidth }
  })
  assert.equal(
    highlight.minimumAlpha,
    255,
    'Highlighted rows must not have translucent seams between cells'
  )
  assert.deepEqual(errors, [])
  console.log(
    engineName,
    'JetBrains Mono font bridge and ligature pixel checks passed'
  )
} finally {
  await browser.close()
}
