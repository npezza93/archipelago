// Direct binding to the official libghostty-vt 1.0 C ABI. Layouts and enum
// values come from the module itself; no patched Ghostty exports are used.
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const primitives = {
  bool: [1, 'Uint8'],
  u8: [1, 'Uint8'],
  u16: [2, 'Uint16'],
  u32: [4, 'Uint32'],
  i32: [4, 'Int32'],
  u64: [8, 'BigUint64'],
  i64: [8, 'BigInt64'],
  f32: [4, 'Float32'],
  f64: [8, 'Float64'],
  pointer: [4, 'Uint32'],
}

// A tiny typed WASM import/export wrapper makes a JS callback callable through
// the official module's function table, including Safari without WebAssembly.Function.
function callbackFunction(arity, callback) {
  const section = (id, bytes) => [id, bytes.length, ...bytes]
  const bytes = [
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    ...section(1, [1, 96, arity, ...Array(arity).fill(127), 0]),
    ...section(2, [1, 1, 101, 1, 102, 0, 0]),
    ...section(7, [1, 1, 102, 0, 0]),
  ]
  return new WebAssembly.Instance(
    new WebAssembly.Module(new Uint8Array(bytes)),
    { e: { f: callback } }
  ).exports.f
}

export class GhosttyVT {
  constructor(instance, cols = 80, rows = 24, callbacks = {}) {
    this.e = instance.exports
    const bytes = new Uint8Array(this.e.memory.buffer)
    const start = this.e.ghostty_type_json()
    this.abi = JSON.parse(
      decoder.decode(bytes.subarray(start, bytes.indexOf(0, start)))
    )
    if (
      this.abi.library_version !== '1.0.0' ||
      this.abi.abi.pointer_size !== 4
    ) {
      throw new Error('Expected the official libghostty-vt 1.0.0 wasm32 ABI')
    }
    this.types = this.abi.types
    this.allocations = []
    this.handles = []
    try {
      this.slot = this.alloc(4)
      this.scratch = this.alloc(1024)
      this.textBuffer = this.alloc(4096)
      this.buffer = this.struct('GhosttyBuffer', {
        ptr: this.textBuffer,
        cap: 4096,
      })
      this.terminal = this.create('terminal', cols, rows)
      this.renderState = this.create('render_state')
      this.rowIterator = this.create('render_state_row_iterator')
      this.cells = this.create('render_state_row_cells')
      this.keyEncoder = this.create('key_encoder')
      this.keyEvent = this.create('key_event')
      this.keyText = this.struct('GhosttyString')
      this.mouseEncoder = this.create('mouse_encoder')
      this.mouseEvent = this.create('mouse_event')
      this.formatter = this.create('formatter_terminal', this.terminal)
      this.gesture = this.create('selection_gesture')
      this.selection = this.alloc(this.types.GhosttySelection.size)
      this.point = this.struct('GhosttyPoint')
      this.ref = this.alloc(this.types.GhosttyGridRef.size)
      this.scrollValue = this.struct('GhosttyTerminalScrollViewport')
      this.cursor = this.struct('GhosttyRenderStateCursor')
      this.colors = this.struct('GhosttyRenderStateColors')
      this.mousePosition = this.struct('GhosttyMousePosition')
      this.mouseSize = this.struct('GhosttyMouseEncoderSize')
      this.gesturePosition = this.struct('GhosttySurfacePosition')
      this.gestureGeometry = this.struct('GhosttySelectionGestureGeometry')
      this.gestureEvents = Object.fromEntries(
        ['PRESS', 'DRAG', 'RELEASE', 'DEEP_PRESS'].map((name) => [
          name,
          this.create(
            'selection_gesture_event',
            this.value('GhosttySelectionGestureEventType', name)
          ),
        ])
      )
      this.callbackSlots = []
      this.callback('WRITE_PTY', 4, (_term, _user, ptr, len) =>
        callbacks.onData?.(this.bytes(ptr, len))
      )
      this.callback('BELL', 2, () => callbacks.onBell?.())
      this.cols = cols
      this.rows = rows
    } catch (error) {
      this.dispose()
      throw error
    }
  }

  check(result) {
    if (result !== 0) throw new Error(`libghostty-vt returned ${result}`)
  }

  value(type, name) {
    return this.types[type].values[name]
  }
  view() {
    return new DataView(this.e.memory.buffer)
  }
  bytes(ptr, len) {
    return new Uint8Array(this.e.memory.buffer, ptr, len).slice()
  }
  alloc(size) {
    const ptr = this.e.ghostty_wasm_alloc(size)
    if (!ptr) throw new Error('libghostty-vt allocation failed')
    new Uint8Array(this.e.memory.buffer, ptr, size).fill(0)
    this.allocations.push([ptr, size])
    return ptr
  }

  type(type) {
    let info = this.types[type]
    while (info?.kind === 'alias') {
      type = info.type
      info = this.types[type]
    }
    return [type, info]
  }

  read(type, ptr) {
    const [name, info] = this.type(type)
    if (info?.kind === 'struct' || info?.kind === 'union') {
      return Object.fromEntries(
        Object.entries(info.fields).map(([key, field]) => [
          key,
          this.read(field.type, ptr + field.offset),
        ])
      )
    }
    if (info?.kind === 'enum' || info?.kind === 'packed')
      return this.read(info.underlying, ptr)
    if (!primitives[name]) return undefined // arrays are read explicitly when needed
    const result = this.view()[`get${primitives[name][1]}`](ptr, true)
    return name === 'bool' ? !!result : result
  }

  put(type, ptr, values) {
    const [name, info] = this.type(type)
    if (info?.kind === 'struct' || info?.kind === 'union') {
      for (const [key, value] of Object.entries(values)) {
        const field = info.fields[key]
        this.put(field.type, ptr + field.offset, value)
      }
    } else if (info?.kind === 'enum' || info?.kind === 'packed') {
      this.put(info.underlying, ptr, values)
    } else {
      this.view()[`set${primitives[name][1]}`](
        ptr,
        name === 'u64' || name === 'i64' ? BigInt(values) : Number(values),
        true
      )
    }
  }

  struct(type, values = {}) {
    const ptr = this.alloc(this.types[type].size)
    this.put(type, ptr, {
      ...(this.types[type].fields.size ? { size: this.types[type].size } : {}),
      ...values,
    })
    return ptr
  }

  create(name, ...args) {
    this.check(this.e[`ghostty_${name}_new`](0, this.slot, ...args))
    const handle = this.e.ghostty_wasm_take_opaque(this.slot)
    this.handles.push([name, handle])
    return handle
  }

  callback(option, arity, fn) {
    const table = this.e.__indirect_function_table
    const index = table.grow(1)
    table.set(index, callbackFunction(arity, fn))
    this.callbackSlots.push(index)
    // Callback and userdata options take the pointer value itself, unlike
    // scalar/struct options which take the address of a value.
    this.check(
      this.e.ghostty_terminal_set(
        this.terminal,
        this.value('GhosttyTerminalOption', option),
        index
      )
    )
  }

  get(name, type = this.types.GhosttyTerminalData.keys[name].type) {
    this.check(
      this.e.ghostty_terminal_get(
        this.terminal,
        this.value('GhosttyTerminalData', name),
        this.scratch
      )
    )
    return this.read(type, this.scratch)
  }

  set(name, value) {
    const type = this.types.GhosttyTerminalOption.keys[name].type
    this.put(type, this.scratch, value)
    this.check(
      this.e.ghostty_terminal_set(
        this.terminal,
        this.value('GhosttyTerminalOption', name),
        this.scratch
      )
    )
  }

  withBytes(data, callback) {
    if (typeof data === 'string') data = encoder.encode(data)
    const ptr = this.e.ghostty_wasm_alloc(data.length)
    if (data.length && !ptr) throw new Error('libghostty-vt allocation failed')
    try {
      new Uint8Array(this.e.memory.buffer, ptr, data.length).set(data)
      return callback(ptr, data.length)
    } finally {
      this.e.ghostty_wasm_free(ptr, data.length)
    }
  }

  write(data) {
    this.withBytes(data, (ptr, len) =>
      this.e.ghostty_terminal_vt_write(this.terminal, ptr, len)
    )
  }

  resize(cols, rows, width, height) {
    this.check(
      this.e.ghostty_terminal_resize(
        this.terminal,
        cols,
        rows,
        Math.round(width),
        Math.round(height)
      )
    )
    this.cols = cols
    this.rows = rows
  }

  mode(mode) {
    this.put('GhosttyTerminalModeConfig', this.scratch, { mode })
    this.check(
      this.e.ghostty_terminal_get(
        this.terminal,
        this.value('GhosttyTerminalData', 'MODE'),
        this.scratch
      )
    )
    return this.read('GhosttyTerminalModeConfig', this.scratch).value
  }

  scroll(tag, delta = 0) {
    this.put('GhosttyTerminalScrollViewport', this.scrollValue, {
      tag: this.value('GhosttyTerminalScrollViewportTag', tag),
      value: { delta },
    })
    this.check(
      this.e.ghostty_terminal_scroll_viewport(this.terminal, this.scrollValue)
    )
  }

  // Uses Ghostty's decoded render state, including full grapheme clusters.
  frame(force = false) {
    this.check(
      this.e.ghostty_render_state_update(this.renderState, this.terminal)
    )
    const get = (name, ptr = this.scratch) =>
      this.check(
        this.e.ghostty_render_state_get(
          this.renderState,
          this.value('GhosttyRenderStateData', name),
          ptr
        )
      )
    get('DIRTY')
    if (!force && !this.read('i32', this.scratch)) return null
    get('CURSOR', this.cursor)
    get('COLORS', this.colors)
    const colors = this.read('GhosttyRenderStateColors', this.colors)
    const cursor = this.read('GhosttyRenderStateCursor', this.cursor)
    this.put('u32', this.slot, this.rowIterator)
    get('ROW_ITERATOR', this.slot)
    const rows = []
    const cellGet = (name, ptr = this.scratch) =>
      this.e.ghostty_render_state_row_cells_get(
        this.cells,
        this.value('GhosttyRenderStateRowCellsData', name),
        ptr
      )
    while (this.e.ghostty_render_state_row_iterator_next(this.rowIterator)) {
      this.put('u32', this.slot, this.cells)
      this.check(
        this.e.ghostty_render_state_row_get(
          this.rowIterator,
          this.value('GhosttyRenderStateRowData', 'CELLS'),
          this.slot
        )
      )
      const cells = []
      while (this.e.ghostty_render_state_row_cells_next(this.cells)) {
        this.check(cellGet('RAW'))
        const raw = this.read('u64', this.scratch)
        const bit = this.types.GhosttyCell.bits.wide
        const wide = Number(
          (raw >> BigInt(bit.lsb)) & ((1n << BigInt(bit.width)) - 1n)
        )
        this.check(cellGet('STYLE'))
        const style = {
          flags: this.read(
            'u16',
            this.scratch + this.types.GhosttyStyle.fields.flags.offset
          ),
        }
        const fgResult = cellGet('FG_COLOR')
        const fg =
          fgResult === 0 ? this.read('GhosttyColorRgb', this.scratch) : null
        if (
          fgResult !== 0 &&
          fgResult !== this.value('GhosttyResult', 'NO_VALUE')
        )
          this.check(fgResult)
        const bgResult = cellGet('BG_COLOR')
        const bg =
          bgResult === 0 ? this.read('GhosttyColorRgb', this.scratch) : null
        if (
          bgResult !== 0 &&
          bgResult !== this.value('GhosttyResult', 'NO_VALUE')
        )
          this.check(bgResult)
        this.check(cellGet('SELECTED'))
        const selected = this.read('bool', this.scratch)
        let textResult = cellGet('GRAPHEMES_UTF8', this.buffer)
        if (textResult === this.value('GhosttyResult', 'OUT_OF_SPACE')) {
          const { len } = this.read('GhosttyBuffer', this.buffer)
          this.textBuffer = this.alloc(len)
          this.put('GhosttyBuffer', this.buffer, {
            ptr: this.textBuffer,
            cap: len,
          })
          textResult = cellGet('GRAPHEMES_UTF8', this.buffer)
        }
        this.check(textResult)
        const { ptr, len } = this.read('GhosttyBuffer', this.buffer)
        cells.push({
          text: decoder.decode(new Uint8Array(this.e.memory.buffer, ptr, len)),
          wide,
          style,
          fg,
          bg,
          selected,
        })
      }
      rows.push(cells)
    }
    this.check(this.e.ghostty_render_state_clean(this.renderState))
    return { rows, colors, cursor }
  }

  output(call) {
    let size = 256
    let ptr = this.e.ghostty_wasm_alloc(size)
    try {
      let result = call(ptr, size, this.slot)
      if (result === this.value('GhosttyResult', 'OUT_OF_SPACE')) {
        const needed = this.read('u32', this.slot)
        this.e.ghostty_wasm_free(ptr, size)
        size = needed
        ptr = this.e.ghostty_wasm_alloc(size)
        result = call(ptr, size, this.slot)
      }
      this.check(result)
      return this.bytes(ptr, this.read('u32', this.slot))
    } finally {
      this.e.ghostty_wasm_free(ptr, size)
    }
  }

  key({ code, key, action = 'PRESS', mods = 0, consumedMods = 0 }) {
    const name = code
      .replace(/^Key/, '')
      .replace(/([a-z])([A-Z0-9])/g, '$1_$2')
      .toUpperCase()
    const keyCode = this.types.GhosttyKey.values[name] ?? 0
    this.check(
      this.e.ghostty_key_encoder_set_from_terminal(
        this.keyEncoder,
        this.terminal
      )
    )
    this.check(
      this.e.ghostty_key_event_set_action(
        this.keyEvent,
        this.value('GhosttyKeyAction', action)
      )
    )
    this.check(this.e.ghostty_key_event_set_key(this.keyEvent, keyCode))
    this.check(this.e.ghostty_key_event_set_mods(this.keyEvent, mods))
    this.check(
      this.e.ghostty_key_event_set_consumed_mods(this.keyEvent, consumedMods)
    )
    this.check(
      this.e.ghostty_key_event_set_unshifted_codepoint(
        this.keyEvent,
        key?.length === 1 ? key.toLowerCase().codePointAt(0) : 0
      )
    )
    const text = key && [...key].length === 1 ? key : ''
    return this.withBytes(text, (ptr, len) => {
      this.put('GhosttyString', this.keyText, { ptr, len })
      this.check(this.e.ghostty_key_event_set_utf8(this.keyEvent, this.keyText))
      return this.output((out, size, written) =>
        this.e.ghostty_key_encoder_encode(
          this.keyEncoder,
          this.keyEvent,
          out,
          size,
          written
        )
      )
    })
  }

  paste(text) {
    return this.withBytes(text, (ptr, len) =>
      this.output((out, size, written) =>
        this.e.ghostty_paste_encode(
          ptr,
          len,
          this.mode(2004),
          out,
          size,
          written
        )
      )
    )
  }

  mouse(action, button, x, y, mods, width, height, buttons = 0) {
    this.check(
      this.e.ghostty_mouse_encoder_set_from_terminal(
        this.mouseEncoder,
        this.terminal
      )
    )
    this.put('GhosttyMouseEncoderSize', this.mouseSize, {
      screen_width: Math.round(this.cols * width),
      screen_height: Math.round(this.rows * height),
      cell_width: Math.round(width),
      cell_height: Math.round(height),
    })
    this.check(
      this.e.ghostty_mouse_encoder_set(
        this.mouseEncoder,
        this.value('GhosttyMouseEncoderOption', 'SIZE'),
        this.mouseSize
      )
    )
    this.put('bool', this.scratch, buttons !== 0)
    this.check(
      this.e.ghostty_mouse_encoder_set(
        this.mouseEncoder,
        this.value('GhosttyMouseEncoderOption', 'ANY_BUTTON_PRESSED'),
        this.scratch
      )
    )
    this.check(
      this.e.ghostty_mouse_event_set_action(
        this.mouseEvent,
        this.value('GhosttyMouseAction', action)
      )
    )
    if (button)
      this.check(this.e.ghostty_mouse_event_set_button(this.mouseEvent, button))
    else this.e.ghostty_mouse_event_clear_button(this.mouseEvent)
    this.check(this.e.ghostty_mouse_event_set_mods(this.mouseEvent, mods))
    this.put('GhosttyMousePosition', this.mousePosition, { x, y })
    this.check(
      this.e.ghostty_mouse_event_set_position(
        this.mouseEvent,
        this.mousePosition
      )
    )
    return this.output((out, size, written) =>
      this.e.ghostty_mouse_encoder_encode(
        this.mouseEncoder,
        this.mouseEvent,
        out,
        size,
        written
      )
    )
  }

  gridRef(x, y) {
    this.put('GhosttyPoint', this.point, {
      tag: this.value('GhosttyPointTag', 'VIEWPORT'),
      value: { coordinate: { x, y } },
    })
    this.check(
      this.e.ghostty_terminal_grid_ref(this.terminal, this.point, this.ref)
    )
    return this.ref
  }

  select(type, x, y, pixelX, pixelY, width, height) {
    const event = this.gestureEvents[type]
    const option = (name, ptr) =>
      this.check(
        this.e.ghostty_selection_gesture_event_set(
          event,
          this.value('GhosttySelectionGestureEventOption', name),
          ptr
        )
      )
    option('REF', this.gridRef(x, y))
    this.put('GhosttySurfacePosition', this.gesturePosition, {
      x: pixelX,
      y: pixelY,
    })
    if (type !== 'RELEASE') option('POSITION', this.gesturePosition)
    this.put('GhosttySelectionGestureGeometry', this.gestureGeometry, {
      columns: this.cols,
      cell_width: Math.round(width),
      screen_height: Math.round(this.rows * height),
      padding_left: 0,
    })
    if (type === 'DRAG') option('GEOMETRY', this.gestureGeometry)
    this.put('u64', this.scratch, BigInt(Math.round(performance.now() * 1e6)))
    if (type === 'PRESS') option('TIME_NS', this.scratch)
    const result = this.e.ghostty_selection_gesture_event(
      this.gesture,
      this.terminal,
      event,
      this.selection
    )
    if (result === 0) {
      this.check(
        this.e.ghostty_terminal_set(
          this.terminal,
          this.value('GhosttyTerminalOption', 'SELECTION'),
          this.selection
        )
      )
      return true
    }
    if (result !== this.value('GhosttyResult', 'NO_VALUE')) this.check(result)
    return false
  }

  clearSelection() {
    this.check(
      this.e.ghostty_terminal_set(
        this.terminal,
        this.value('GhosttyTerminalOption', 'SELECTION'),
        0
      )
    )
  }

  selectionText() {
    const result = this.e.ghostty_terminal_get(
      this.terminal,
      this.value('GhosttyTerminalData', 'SELECTION'),
      this.selection
    )
    if (result === this.value('GhosttyResult', 'NO_VALUE')) return ''
    this.check(result)
    this.check(
      this.e.ghostty_formatter_set(
        this.formatter,
        this.value('GhosttyFormatterOption', 'SELECTION'),
        this.selection
      )
    )
    return decoder.decode(
      this.output((out, size, written) =>
        this.e.ghostty_formatter_format_buf(this.formatter, out, size, written)
      )
    )
  }

  hyperlink(x, y) {
    const ref = this.gridRef(x, y)
    return decoder.decode(
      this.output((out, size, written) =>
        this.e.ghostty_grid_ref_hyperlink_uri(ref, out, size, written)
      )
    )
  }

  dispose() {
    for (const [name, handle] of (this.handles ?? []).reverse()) {
      if (name === 'selection_gesture')
        this.e.ghostty_selection_gesture_free(handle, this.terminal)
      else
        this.e[
          `ghostty_${name === 'formatter_terminal' ? 'formatter' : name}_free`
        ](handle)
    }
    this.handles = []
    for (const index of this.callbackSlots ?? [])
      this.e.__indirect_function_table.set(index, null)
    this.callbackSlots = []
    for (const [ptr, size] of this.allocations ?? [])
      this.e.ghostty_wasm_free(ptr, size)
    this.allocations = []
  }
}
