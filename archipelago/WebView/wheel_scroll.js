// DOM wheel deltas already express pixels, lines, or pages (not raw wheel
// ticks). Normalize once for scrollback, mouse-reporting apps, and alt-scroll.
export default class WheelScroll {
  remainder = 0

  lines(event, cellHeight, rows, destination) {
    if (
      this.destination !== destination ||
      this.cellHeight !== cellHeight ||
      this.deltaMode !== event.deltaMode
    ) {
      this.remainder = 0
      this.destination = destination
      this.cellHeight = cellHeight
      this.deltaMode = event.deltaMode
    }
    const delta =
      event.deltaMode === 1
        ? event.deltaY
        : event.deltaMode === 2
          ? event.deltaY * rows
          : event.deltaY / cellHeight
    this.remainder += delta
    const lines = Math.trunc(this.remainder)
    this.remainder -= lines
    return lines || 0
  }
}

// Batch repeated mouse/key reports into a single native bridge write.
export function repeatBytes(bytes, count) {
  if (count === 1) return bytes
  const repeated = new Uint8Array(bytes.length * count)
  for (let i = 0; i < count; i++) repeated.set(bytes, i * bytes.length)
  return repeated
}
