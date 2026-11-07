import Color from 'color'
import { GhosttyVT } from './libghostty'

const rgb = (color) => `rgb(${color.r}, ${color.g}, ${color.b})`
const paletteNames = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
]
const mods = (event) =>
  (event.shiftKey ? 1 : 0) |
  (event.ctrlKey ? 2 : 0) |
  (event.altKey ? 4 : 0) |
  (event.metaKey ? 8 : 0)

export default class GhosttyTerminal {
  constructor(module, element, settings, callbacks) {
    this.element = element
    this.callbacks = callbacks
    this.settings = settings
    this.abort = new AbortController()
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('aria-hidden', 'true')
    this.textarea = document.createElement('textarea')
    this.textarea.className = 'ghostty-input'
    this.textarea.setAttribute('aria-label', 'Terminal input')
    this.textarea.setAttribute('autocapitalize', 'off')
    this.textarea.setAttribute('autocorrect', 'off')
    this.textarea.spellcheck = false
    this.scrollbar = document.createElement('div')
    this.scrollbar.className = 'ghostty-scrollbar'
    this.scrollbar.setAttribute('role', 'scrollbar')
    this.scrollbar.setAttribute('aria-label', 'Terminal scrollback')
    this.scrollbar.setAttribute('aria-orientation', 'vertical')
    this.scrollbar.tabIndex = 0
    this.thumb = document.createElement('div')
    this.scrollbar.append(this.thumb)
    element.append(this.canvas, this.textarea, this.scrollbar)
    this.context = this.canvas.getContext('2d')
    try {
      this.vt = new GhosttyVT(new WebAssembly.Instance(module), 80, 24, {
        onData: (data) => this.callbacks.onData(data),
        onBell: () => this.callbacks.onBell(),
      })
      this.updateSettings(settings)
      this.bindInput()
      this.observer = new ResizeObserver(() => this.fit())
      this.observer.observe(element)
      this.blinkTimer = setInterval(() => {
        this.blink = !this.blink
        if (
          this.lastFrame?.cursor.blinking ||
          this.lastFrame?.rows.some((row) =>
            row.some((cell) => cell.style.flags & 8)
          )
        )
          this.scheduleRender(true)
      }, 500)
      this.fit()
      this.focus()
    } catch (error) {
      this.dispose()
      throw error
    }
  }

  updateSettings(settings) {
    this.settings = settings
    const color = (value) => {
      const [r, g, b] = Color(value).rgb().array()
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
    }
    for (const [key, option] of [
      ['foreground', 'COLOR_FOREGROUND'],
      ['background', 'COLOR_BACKGROUND'],
      ['cursor', 'COLOR_CURSOR'],
    ]) {
      this.vt.set(option, color(settings.theme[key]))
    }
    // Start with Ghostty's 256-color palette, then apply the profile's ANSI 16.
    this.vt.check(
      this.vt.e.ghostty_terminal_get(
        this.vt.terminal,
        this.vt.value('GhosttyTerminalData', 'COLOR_PALETTE_DEFAULT'),
        this.vt.scratch
      )
    )
    paletteNames.forEach((name, i) => {
      const { r, g, b } = color(settings.theme[name])
      new Uint8Array(this.vt.e.memory.buffer, this.vt.scratch + i * 3, 3).set([
        r,
        g,
        b,
      ])
    })
    this.vt.check(
      this.vt.e.ghostty_terminal_set(
        this.vt.terminal,
        this.vt.value('GhosttyTerminalOption', 'COLOR_PALETTE'),
        this.vt.scratch
      )
    )
    this.vt.set('SCROLLBACK_MAX_LINES', settings.scrollback)
    this.vt.set(
      'DEFAULT_CURSOR_STYLE',
      this.vt.value('GhosttyCursorStyle', settings.cursorStyle.toUpperCase())
    )
    this.vt.set('DEFAULT_CURSOR_BLINK', settings.cursorBlink)
    // Rendering images is outside this canvas renderer's scope. Advertise no
    // Kitty image storage rather than accept and silently lose image output.
    this.vt.put('u64', this.vt.scratch, 0n)
    const images = this.vt.e.ghostty_terminal_set(
      this.vt.terminal,
      this.vt.value('GhosttyTerminalOption', 'KITTY_IMAGE_STORAGE_LIMIT'),
      this.vt.scratch
    )
    if (images !== this.vt.value('GhosttyResult', 'UNSUPPORTED'))
      this.vt.check(images)
    this.resetFont()
  }

  resetFont() {
    this.context.font = `${this.settings.fontWeight} ${this.settings.fontSize}px ${this.settings.fontFamily}`
    const metrics = this.context.measureText('M')
    this.cellWidth = metrics.width
    this.cellHeight = Math.ceil(this.settings.fontSize * 1.2)
    this.baseline = Math.ceil(
      (this.cellHeight - this.settings.fontSize) / 2 +
        this.settings.fontSize * 0.8
    )
    this.fit()
    this.scheduleRender(true)
  }

  fit() {
    if (!this.vt || this.disposed || !this.cellWidth) return
    const width = this.element.clientWidth
    const height = this.element.clientHeight
    if (!width || !height) return
    const cols = Math.max(
      2,
      Math.min(65535, Math.floor((width - 12) / this.cellWidth))
    )
    const rows = Math.max(
      1,
      Math.min(65535, Math.floor(height / this.cellHeight))
    )
    const dpr = window.devicePixelRatio || 1
    if (
      cols !== this.vt.cols ||
      rows !== this.vt.rows ||
      this.dpr !== dpr ||
      this.measuredWidth !== this.cellWidth ||
      this.measuredHeight !== this.cellHeight
    ) {
      this.vt.resize(cols, rows, this.cellWidth, this.cellHeight)
      this.dpr = dpr
      this.measuredWidth = this.cellWidth
      this.measuredHeight = this.cellHeight
      this.canvas.width = Math.ceil(cols * this.cellWidth * dpr)
      this.canvas.height = Math.ceil(rows * this.cellHeight * dpr)
      this.canvas.style.width = `${cols * this.cellWidth}px`
      this.canvas.style.height = `${rows * this.cellHeight}px`
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0)
      this.callbacks.onResize({ cols, rows })
      this.scheduleRender(true)
    }
  }

  write(data) {
    this.vt.write(data)
    this.scheduleRender()
  }

  scheduleRender(force = false) {
    if (this.disposed) return
    this.forceRender ||= force
    if (this.animationFrame) return
    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = null
      const frame = this.vt.frame(this.forceRender)
      this.forceRender = false
      if (frame) {
        this.lastFrame = frame
        this.draw(frame)
      }
    })
  }

  draw({ rows, colors, cursor }) {
    const ctx = this.context
    const { theme, fontSize, fontFamily, fontWeight, ligatures } = this.settings
    const defaultBG = rgb(colors.background)
    const profileBG = rgb({
      r: Math.round(Color(theme.background).red()),
      g: Math.round(Color(theme.background).green()),
      b: Math.round(Color(theme.background).blue()),
    })
    ctx.clearRect(
      0,
      0,
      this.canvas.width / this.dpr,
      this.canvas.height / this.dpr
    )
    if (defaultBG !== profileBG) {
      ctx.fillStyle = defaultBG
      ctx.fillRect(
        0,
        0,
        this.canvas.width / this.dpr,
        this.canvas.height / this.dpr
      )
    }
    const appearance = (cell) => {
      const flags = cell.style.flags
      let fg = rgb(cell.fg ?? colors.foreground)
      let bg = cell.bg ? rgb(cell.bg) : null
      if (flags & 16) [fg, bg] = [bg ?? defaultBG, fg]
      if (cell.selected) {
        fg = theme.selectionForeground || fg
        bg = theme.selectionBackground
      }
      return { fg, bg, flags }
    }
    rows.forEach((cells, y) => {
      // Paint all backgrounds first so wide glyphs and ligatures stay intact.
      cells.forEach((cell, x) => {
        const { bg } = appearance(cell)
        if (bg) {
          ctx.fillStyle = bg
          ctx.fillRect(
            x * this.cellWidth,
            y * this.cellHeight,
            this.cellWidth * (cell.wide === 1 ? 2 : 1),
            this.cellHeight
          )
        }
      })
      for (let x = 0; x < cells.length; x++) {
        const cell = cells[x]
        if (cell.wide >= 2 || !cell.text) continue
        const { fg, flags } = appearance(cell)
        if (flags & 32 || (flags & 8 && this.blink)) continue
        const font = `${flags & 2 ? 'italic ' : ''}${flags & 1 ? '500' : fontWeight} ${fontSize}px ${fontFamily}`
        ctx.font = font
        ctx.fillStyle = fg
        ctx.globalAlpha = flags & 4 ? 0.5 : 1
        let text = cell.text
        let end = x
        if (ligatures && cell.wide === 0) {
          while (
            end + 1 < cells.length &&
            cells[end + 1].wide === 0 &&
            cells[end + 1].text
          ) {
            const next = appearance(cells[end + 1])
            if (
              next.fg !== fg ||
              next.flags !== flags ||
              cells[end + 1].selected !== cell.selected
            )
              break
            text += cells[++end].text
          }
        }
        ctx.save()
        ctx.beginPath()
        ctx.rect(
          x * this.cellWidth,
          y * this.cellHeight,
          (end - x + (cell.wide === 1 ? 2 : 1)) * this.cellWidth,
          this.cellHeight
        )
        ctx.clip()
        ctx.fillText(
          text,
          x * this.cellWidth,
          y * this.cellHeight + this.baseline
        )
        ctx.restore()
        const decorationWidth =
          (end - x + (cell.wide === 1 ? 2 : 1)) * this.cellWidth
        if (flags & 0x700)
          ctx.fillRect(
            x * this.cellWidth,
            (y + 1) * this.cellHeight - 2,
            decorationWidth,
            1
          )
        if (flags & 64)
          ctx.fillRect(
            x * this.cellWidth,
            y * this.cellHeight + this.baseline / 2,
            decorationWidth,
            1
          )
        if (flags & 128)
          ctx.fillRect(
            x * this.cellWidth,
            y * this.cellHeight,
            decorationWidth,
            1
          )
        ctx.globalAlpha = 1
        x = end
      }
    })
    if (
      cursor.visible &&
      cursor.viewport_has_value &&
      (!cursor.blinking || !this.blink)
    ) {
      const x = cursor.viewport_x * this.cellWidth
      const y = cursor.viewport_y * this.cellHeight
      ctx.fillStyle = colors.cursor_has_value
        ? rgb(colors.cursor)
        : theme.cursor
      if (cursor.visual_style === 0) ctx.fillRect(x, y, 2, this.cellHeight)
      else if (cursor.visual_style === 2)
        ctx.fillRect(x, y + this.cellHeight - 2, this.cellWidth, 2)
      else if (
        cursor.visual_style === 3 ||
        document.activeElement !== this.textarea
      ) {
        ctx.strokeStyle = ctx.fillStyle
        ctx.strokeRect(
          x + 0.5,
          y + 0.5,
          this.cellWidth - 1,
          this.cellHeight - 1
        )
      } else {
        ctx.fillRect(x, y, this.cellWidth, this.cellHeight)
        const cell = rows[cursor.viewport_y]?.[cursor.viewport_x]
        ctx.fillStyle = theme.cursorAccent || defaultBG
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        ctx.fillText(cell?.text || '', x, y + this.baseline)
      }
      this.textarea.style.left = `${x}px`
      this.textarea.style.top = `${y}px`
    }
    const scrollbar = this.vt.get('SCROLLBAR')
    const total = Number(scrollbar.total)
    const offset = Number(scrollbar.offset)
    const len = Number(scrollbar.len)
    this.scrollbar.hidden = total <= len
    this.scrollbar.setAttribute('aria-valuemin', '0')
    this.scrollbar.setAttribute(
      'aria-valuemax',
      String(Math.max(0, total - len))
    )
    this.scrollbar.setAttribute('aria-valuenow', String(offset))
    this.thumb.style.height = `${Math.max(3, (len / total) * 100)}%`
    this.thumb.style.top = `${(offset / total) * 100}%`
  }

  on(element, type, callback, options = {}) {
    element.addEventListener(type, callback, {
      ...options,
      signal: this.abort.signal,
    })
  }

  send(data) {
    if (!data.length) return
    this.vt.clearSelection()
    this.vt.scroll('BOTTOM')
    this.callbacks.onData(data)
    this.blink = false
    this.scheduleRender(true)
  }

  bindInput() {
    const mappedKeys = new Set()
    this.on(this.textarea, 'keydown', (event) => {
      if (event.isComposing || event.key === 'Process' || event.key === 'Dead')
        return
      if (this.callbacks.onKey(event)) {
        mappedKeys.add(event.code)
        event.preventDefault()
        return
      }
      if (event.metaKey && ['c', 'v', 'x'].includes(event.key.toLowerCase()))
        return
      if (
        event.altKey &&
        [...event.key].length === 1 &&
        !this.settings.macOptionIsMeta &&
        !event.ctrlKey &&
        !event.metaKey
      )
        return
      this.send(
        this.vt.key({
          code: event.code,
          key: event.key,
          mods: mods(event),
          action: event.repeat ? 'REPEAT' : 'PRESS',
          consumedMods: event.shiftKey ? 1 : 0,
        })
      )
      event.preventDefault()
    })
    this.on(this.textarea, 'keyup', (event) => {
      if (mappedKeys.delete(event.code)) return
      if (
        event.isComposing ||
        event.metaKey ||
        (event.altKey && !this.settings.macOptionIsMeta)
      )
        return
      const data = this.vt.key({
        code: event.code,
        key: event.key,
        mods: mods(event),
        action: 'RELEASE',
      })
      if (data.length) this.send(data)
    })
    this.on(this.textarea, 'input', (event) => {
      if (event.isComposing) return
      if (this.textarea.value)
        this.send(new TextEncoder().encode(this.textarea.value))
      this.textarea.value = ''
    })
    this.on(this.textarea, 'paste', (event) => {
      event.preventDefault()
      this.send(this.vt.paste(event.clipboardData.getData('text/plain')))
    })
    this.on(this.textarea, 'copy', (event) => {
      const selection = this.vt.selectionText()
      if (selection) {
        event.clipboardData.setData('text/plain', selection)
        event.preventDefault()
      }
    })
    for (const [name, sequence] of [
      ['focus', '\x1b[I'],
      ['blur', '\x1b[O'],
    ]) {
      this.on(this.textarea, name, () => {
        if (this.vt.mode(1004))
          this.callbacks.onData(new TextEncoder().encode(sequence))
        this.scheduleRender(true)
      })
    }
    this.on(this.canvas, 'pointerdown', (event) => {
      event.preventDefault()
      this.focus()
      this.canvas.setPointerCapture(event.pointerId)
      if (this.mouseReport(event, 'PRESS')) return
      if (event.button === 2 && !this.settings.rightClickSelectsWord) return
      if (event.button !== 0 && event.button !== 2) return
      this.selecting = true
      this.vt.clearSelection()
      this.selectionEvent('PRESS', event)
      if (event.button === 2) {
        // A deep press selects the word without modifying click-repeat state.
        const deep = this.vt.gestureEvents.DEEP_PRESS
        const result = this.vt.e.ghostty_selection_gesture_event(
          this.vt.gesture,
          this.vt.terminal,
          deep,
          this.vt.selection
        )
        if (result === 0)
          this.vt.check(
            this.vt.e.ghostty_terminal_set(
              this.vt.terminal,
              this.vt.value('GhosttyTerminalOption', 'SELECTION'),
              this.vt.selection
            )
          )
        this.scheduleRender(true)
      }
    })
    this.on(this.canvas, 'pointermove', (event) => {
      if (this.selecting) {
        const rect = this.canvas.getBoundingClientRect()
        if (event.clientY < rect.top || event.clientY > rect.bottom)
          this.vt.scroll('DELTA', event.clientY < rect.top ? -1 : 1)
        this.selectionEvent('DRAG', event)
      } else this.mouseReport(event, 'MOTION')
    })
    this.on(this.canvas, 'pointerup', (event) => {
      if (this.selecting) {
        this.selectionEvent('RELEASE', event)
        this.selecting = false
        if (this.settings.copyOnSelect) this.copySelection()
      } else this.mouseReport(event, 'RELEASE')
    })
    this.on(this.canvas, 'pointercancel', () => {
      this.selecting = false
    })
    this.on(this.canvas, 'click', (event) => {
      if ((event.metaKey || event.ctrlKey) && !this.vt.selectionText())
        this.openLink(event)
    })
    this.on(
      this.element,
      'wheel',
      (event) => {
        event.preventDefault()
        const delta =
          event.deltaMode === 1 ? event.deltaY : event.deltaY / this.cellHeight
        if (this.vt.get('MOUSE_TRACKING') && !event.shiftKey) {
          this.mouseReport(event, 'PRESS', event.deltaY < 0 ? 4 : 5)
        } else if (this.vt.get('ACTIVE_SCREEN') === 1 && this.vt.mode(1007)) {
          const key = delta < 0 ? 'ArrowUp' : 'ArrowDown'
          this.send(this.vt.key({ code: key, key }))
        } else {
          this.wheelRemainder = (this.wheelRemainder || 0) + delta
          const lines = Math.trunc(this.wheelRemainder)
          if (lines) {
            this.vt.scroll('DELTA', lines)
            this.wheelRemainder -= lines
            this.scheduleRender()
          }
        }
      },
      { passive: false }
    )
    const scrollToPointer = (event) => {
      const rect = this.scrollbar.getBoundingClientRect()
      const bar = this.vt.get('SCROLLBAR')
      this.vt.scroll(
        'ROW',
        Math.max(
          0,
          Math.round(
            ((event.clientY - rect.top) / rect.height) * Number(bar.total) -
              Number(bar.len) / 2
          )
        )
      )
      this.scheduleRender()
    }
    this.on(this.scrollbar, 'pointerdown', (event) => {
      this.scrollbar.setPointerCapture(event.pointerId)
      scrollToPointer(event)
    })
    this.on(this.scrollbar, 'pointermove', (event) => {
      if (event.buttons) scrollToPointer(event)
    })
    this.on(this.scrollbar, 'keydown', (event) => {
      if (
        ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(
          event.key
        )
      ) {
        event.preventDefault()
        if (event.key === 'Home' || event.key === 'End')
          this.vt.scroll(event.key === 'Home' ? 'TOP' : 'BOTTOM')
        else
          this.vt.scroll(
            'DELTA',
            (event.key.endsWith('Up') ? -1 : 1) *
              (event.key.startsWith('Page') ? this.vt.rows : 1)
          )
        this.scheduleRender()
      }
    })
  }

  position(event) {
    const rect = this.canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left))
    const y = Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top))
    return {
      x,
      y,
      col: Math.floor(x / this.cellWidth),
      row: Math.floor(y / this.cellHeight),
    }
  }

  mouseReport(event, action, button) {
    if (
      !this.vt.get('MOUSE_TRACKING') ||
      event.shiftKey ||
      (event.altKey && this.settings.macOptionClickForcesSelection)
    )
      return false
    const { x, y } = this.position(event)
    const buttonMap = [1, 3, 2]
    this.callbacks.onData(
      this.vt.mouse(
        action,
        button ?? buttonMap[event.button],
        x,
        y,
        mods(event),
        this.cellWidth,
        this.cellHeight,
        event.buttons
      )
    )
    return true
  }

  selectionEvent(type, event) {
    const { x, y, col, row } = this.position(event)
    this.vt.select(type, col, row, x, y, this.cellWidth, this.cellHeight)
    this.scheduleRender(true)
  }

  copySelection() {
    const text = this.vt.selectionText()
    if (text)
      navigator.clipboard
        .writeText(text)
        .catch((error) => console.error('Could not copy selection', error))
  }

  openLink(event) {
    const { col, row } = this.position(event)
    let uri = this.vt.hyperlink(col, row)
    if (!uri) {
      const cells = this.lastFrame?.rows[row] || []
      let text = '',
        offset = 0
      cells.forEach((cell, x) => {
        if (x < col) offset += cell.text.length
        text += cell.text
      })
      for (const match of text.matchAll(/https?:\/\/[^\s<>"']+/g)) {
        if (offset >= match.index && offset < match.index + match[0].length)
          uri = match[0].replace(/[.,;!)\]]+$/, '')
      }
    }
    if (!uri || !/^(https?:|mailto:|ftp:|ssh:)/i.test(uri)) return
    const anchor = document.createElement('a')
    anchor.href = uri
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    anchor.click()
  }

  focus() {
    this.textarea.focus({ preventScroll: true })
  }

  dispose() {
    this.disposed = true
    this.abort?.abort()
    this.observer?.disconnect()
    clearInterval(this.blinkTimer)
    cancelAnimationFrame(this.animationFrame)
    this.vt?.dispose()
    this.canvas?.remove()
    this.textarea?.remove()
    this.scrollbar?.remove()
  }
}
