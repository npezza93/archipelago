import { expect, test } from 'bun:test'
import WheelScroll from './wheel_scroll'

const wheel = (
  scroll,
  deltaY,
  deltaMode = 0,
  destination = 'mouse',
  height = 20,
  rows = 30
) => scroll.lines({ deltaY, deltaMode }, height, rows, destination)

test('mouse reporting preserves the number of scrolled rows', () => {
  const scroll = new WheelScroll()
  expect(wheel(scroll, 100)).toBe(5)
  expect(wheel(scroll, -60)).toBe(-3)
  expect(wheel(scroll, 0)).toBe(0)
})

test('small trackpad deltas accumulate without emitting a report per event', () => {
  const scroll = new WheelScroll()
  expect(wheel(scroll, 5)).toBe(0)
  expect(wheel(scroll, 5)).toBe(0)
  expect(wheel(scroll, 15)).toBe(1)
  expect(wheel(scroll, 15)).toBe(1)
  expect(wheel(scroll, -10)).toBe(0)
  expect(wheel(scroll, -10)).toBe(-1)
})

test('line and page deltas retain their browser-provided distance', () => {
  const scroll = new WheelScroll()
  expect(wheel(scroll, 3, 1)).toBe(3)
  expect(wheel(scroll, -2, 1)).toBe(-2)
  expect(wheel(scroll, 1, 2)).toBe(30)
  expect(wheel(scroll, -1, 2)).toBe(-30)
})

test('pending fractions do not leak across scrolling destinations or font sizes', () => {
  const scroll = new WheelScroll()
  expect(wheel(scroll, 15)).toBe(0)
  expect(wheel(scroll, 5, 0, 'viewport')).toBe(0)
  expect(wheel(scroll, 15, 0, 'viewport')).toBe(1)
  expect(wheel(scroll, 15, 0, 'mouse')).toBe(0)
  expect(wheel(scroll, 5, 0, 'mouse', 25)).toBe(0)
  expect(wheel(scroll, 20, 0, 'mouse', 25)).toBe(1)
})
