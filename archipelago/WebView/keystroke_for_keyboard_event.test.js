import { expect, test } from 'bun:test'
import keystrokeForKeyboardEvent from './keystroke_for_keyboard_event'

function stroke(key, code, modifiers = {}) {
  return keystrokeForKeyboardEvent({
    key,
    code,
    type: 'keydown',
    getModifierState: () => false,
    ...modifiers,
  })
}

test('matches Option letter bindings using the unmodified layout character', () => {
  expect(stroke('å', 'KeyA', { altKey: true })).toBe('alt-a')
  expect(stroke('Å', 'KeyA', { altKey: true, shiftKey: true })).toBe(
    'alt-shift-A'
  )
  expect(stroke('∂', 'KeyD', { altKey: true })).toBe('alt-d')
})

test('matches Option dead keys without inserting the accent', () => {
  expect(stroke('Dead', 'KeyE', { altKey: true })).toBe('alt-e')
  expect(stroke('Dead', 'KeyN', { altKey: true })).toBe('alt-n')
})

test('matches Option arrows and combined modifiers', () => {
  expect(stroke('ArrowLeft', 'ArrowLeft', { altKey: true })).toBe('alt-left')
  expect(
    stroke('ArrowRight', 'ArrowRight', { altKey: true, shiftKey: true })
  ).toBe('alt-shift-right')
  expect(stroke('å', 'KeyA', { altKey: true, metaKey: true })).toBe('alt-cmd-a')
})
