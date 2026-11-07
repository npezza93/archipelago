import { afterEach, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { GhosttyVT } from './libghostty'

const bytes = await Bun.file(
  new URL('./vendor/ghostty-vt-1.0.0.wasm', import.meta.url)
).arrayBuffer()
const module = await WebAssembly.compile(bytes)
const terminals = []
const decode = (bytes) => new TextDecoder().decode(bytes)
function terminal(cols = 80, rows = 24, callbacks = {}) {
  const vt = new GhosttyVT(
    new WebAssembly.Instance(module),
    cols,
    rows,
    callbacks
  )
  terminals.push(vt)
  return vt
}
afterEach(() => {
  for (const vt of terminals.splice(0)) vt.dispose()
})
const text = (vt) =>
  vt.frame(true).rows.map((row) =>
    row
      .map((cell) => cell.text || ' ')
      .join('')
      .trimEnd()
  )

test('uses the checksummed official stable 1.0.0 artifact', () => {
  expect(createHash('sha256').update(new Uint8Array(bytes)).digest('hex')).toBe(
    '7b428fee6d0677bc81279458f8f9a3335454834123a9ff47efb3fd177f6da5a8'
  )
  expect(terminal().abi.library_version).toBe('1.0.0')
})

test('preserves UTF-8 and escape sequences split across PTY reads', () => {
  const vt = terminal()
  const data = new TextEncoder().encode('héllo 👻\x1b[31m red\x1b[0m')
  for (const byte of data) vt.write(new Uint8Array([byte]))
  const frame = vt.frame()
  expect(frame.rows[0].map((cell) => cell.text).join('')).toContain(
    'héllo 👻 red'
  )
  expect(frame.rows[0].find((cell) => cell.text === 'r').fg).not.toBeNull()
  expect(vt.frame()).toBeNull()
})

test('bell callbacks distinguish BEL from OSC terminators', () => {
  let bells = 0
  const replies = []
  const vt = terminal(80, 24, {
    onBell: () => bells++,
    onData: (data) => replies.push(decode(data)),
  })
  vt.write('\x1b]0;title\x07hello\x07\x1b[6n')
  expect(bells).toBe(1)
  expect(replies).toEqual(['\x1b[1;6R'])
})

test('alternate-screen programs restore the normal screen', () => {
  const vt = terminal()
  vt.write('shell\x1b[?1049h\x1b[Heditor')
  expect(vt.get('ACTIVE_SCREEN')).toBe(1)
  expect(text(vt)[0]).toBe('editor')
  vt.write('\x1b[?1049l')
  expect(text(vt)[0]).toBe('shell')
})

test('encodes normal, control, modified, application-cursor and Kitty keys', () => {
  const vt = terminal()
  expect(decode(vt.key({ code: 'KeyA', key: 'a' }))).toBe('a')
  expect(decode(vt.key({ code: 'KeyC', key: 'c', mods: 2 }))).toBe('\x03')
  expect(decode(vt.key({ code: 'ArrowUp', key: 'ArrowUp' }))).toBe('\x1b[A')
  expect(decode(vt.key({ code: 'ArrowLeft', key: 'ArrowLeft', mods: 4 }))).toBe(
    '\x1b[1;3D'
  )
  vt.write('\x1b[?1h')
  expect(decode(vt.key({ code: 'ArrowUp', key: 'ArrowUp' }))).toBe('\x1bOA')
  vt.write('\x1b[>3u')
  expect(decode(vt.key({ code: 'KeyC', key: 'c', mods: 2 }))).toBe('\x1b[99;5u')
  expect(
    decode(vt.key({ code: 'KeyC', key: 'c', mods: 2, action: 'RELEASE' }))
  ).toBe('\x1b[99;5:3u')
})

test('paste honors the current bracketed-paste mode and sanitizes ESC', () => {
  const vt = terminal()
  expect(decode(vt.paste('one\ntwo'))).toBe('one\rtwo')
  vt.write('\x1b[?2004h')
  expect(decode(vt.paste('one\ntwo'))).toBe('\x1b[200~one\ntwo\x1b[201~')
  expect(decode(vt.paste('\x1b[201~bad'))).not.toContain('\x1b[201~bad')
})

test('mouse encoding follows the application SGR mode', () => {
  const vt = terminal()
  vt.write('\x1b[?1000h\x1b[?1006h')
  expect(vt.get('MOUSE_TRACKING')).toBe(true)
  expect(decode(vt.mouse('PRESS', 1, 15, 25, 0, 10, 10, 1))).toBe(
    '\x1b[<0;2;3M'
  )
  expect(decode(vt.mouse('RELEASE', 1, 15, 25, 0, 10, 10))).toBe('\x1b[<0;2;3m')
})

test('selection uses Ghostty grid refs, highlights cells and formats text', () => {
  const vt = terminal()
  vt.write('hello world')
  vt.select('PRESS', 0, 0, 2, 5, 10, 20)
  vt.select('DRAG', 4, 0, 49, 5, 10, 20)
  expect(vt.selectionText()).toBe('hello')
  expect(vt.frame(true).rows[0][0].selected).toBe(true)
  vt.select('RELEASE', 4, 0, 49, 5, 10, 20)
  vt.clearSelection()
  expect(vt.selectionText()).toBe('')
})

test('scrollback and resize preserve content; current colors update without reset', () => {
  const vt = terminal(20, 3)
  vt.set('SCROLLBACK_MAX_LINES', 100)
  vt.write('one\r\ntwo\r\nthree\r\nfour')
  expect(vt.get('SCROLLBACK_ROWS')).toBeGreaterThan(0)
  vt.scroll('TOP')
  expect(text(vt)[0]).toBe('one')
  vt.scroll('BOTTOM')
  expect(text(vt).join('\n')).toContain('four')
  vt.resize(30, 5, 10, 20)
  vt.set('COLOR_FOREGROUND', { r: 12, g: 34, b: 56 })
  vt.set('COLOR_BACKGROUND', { r: 0, g: 0, b: 0 })
  expect(vt.frame(true).colors.foreground).toEqual({ r: 12, g: 34, b: 56 })
  expect(text(vt).join('\n')).toContain('four')
})

test('OSC 8 hyperlink URIs come from the terminal parser', () => {
  const vt = terminal()
  vt.write('\x1b]8;;https://example.com\x1b\\click\x1b]8;;\x1b\\')
  expect(vt.hyperlink(1, 0)).toBe('https://example.com')
  expect(vt.hyperlink(10, 0)).toBe('')
})

test('memory growth does not leave stale host views', () => {
  const vt = terminal(120, 40)
  const old = vt.e.memory.buffer
  vt.e.memory.grow(1)
  expect(vt.e.memory.buffer).not.toBe(old)
  vt.write('still alive 👻')
  expect(text(vt)[0]).toBe('still alive 👻')
  expect(decode(vt.key({ code: 'Enter', key: 'Enter' }))).toBe('\r')
})

test('terminal instances have independent state and disposal is idempotent', () => {
  const a = terminal(),
    b = terminal()
  a.write('first')
  b.write('second')
  a.dispose()
  a.dispose()
  expect(text(b)[0]).toBe('second')
})

test('upstream minisign signature authenticates the vendored WASM', async () => {
  const { createPublicKey, verify } = await import('node:crypto')
  const publicKey = Buffer.from(
    'RWQlAjJC23149WL2sEpT/l0QKy7hMIFhYdQOFy0Z7z7PbneUgvlsnYcV',
    'base64'
  )
  const lines = (
    await Bun.file(
      new URL('./vendor/ghostty-vt-1.0.0.wasm.minisig', import.meta.url)
    ).text()
  )
    .trim()
    .split('\n')
  const signature = Buffer.from(lines[1], 'base64')
  const key = createPublicKey({
    key: Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      publicKey.subarray(10),
    ]),
    format: 'der',
    type: 'spki',
  })
  expect(signature.subarray(0, 2).toString()).toBe('ED')
  expect(signature.subarray(2, 10)).toEqual(publicKey.subarray(2, 10))
  const hash = createHash('blake2b512').update(new Uint8Array(bytes)).digest()
  expect(verify(null, hash, key, signature.subarray(10))).toBe(true)
  expect(
    verify(
      null,
      Buffer.concat([
        signature.subarray(10),
        Buffer.from(lines[2].slice('trusted comment: '.length)),
      ]),
      key,
      Buffer.from(lines[3], 'base64')
    )
  ).toBe(true)
})
