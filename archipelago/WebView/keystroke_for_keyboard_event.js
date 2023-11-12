const currentKeymaps = require('./current_keymaps')
const MODIFIERS = new Set(['ctrl', 'alt', 'shift', 'cmd'])
const KEY_NAMES_BY_KEYBOARD_EVENT_CODE = {
  Space: 'space',
  Backspace: 'backspace'
}
const NON_CHARACTER_KEY_NAMES_BY_KEYBOARD_EVENT_KEY = {
  Control: 'ctrl',
  Meta: 'cmd',
  ArrowDown: 'down',
  ArrowUp: 'up',
  ArrowLeft: 'left',
  ArrowRight: 'right'
}
const NUMPAD_KEY_NAMES_BY_KEYBOARD_EVENT_CODE = {
  Numpad0: 'numpad0',
  Numpad1: 'numpad1',
  Numpad2: 'numpad2',
  Numpad3: 'numpad3',
  Numpad4: 'numpad4',
  Numpad5: 'numpad5',
  Numpad6: 'numpad6',
  Numpad7: 'numpad7',
  Numpad8: 'numpad8',
  Numpad9: 'numpad9'
}

const isASCIICharacter = character => (character != null) && (character.length === 1) && (character.charCodeAt(0) <= 127)

var isLatinCharacter = character => (character != null) && (character.length === 1) && (character.charCodeAt(0) <= 0x024F)

const isUpperCaseCharacter = character => (character != null) && (character.length === 1) && (character.toLowerCase() !== character)

const isLowerCaseCharacter = character => (character != null) && (character.length === 1) && (character.toUpperCase() !== character)

const normalizeKeystroke = function (keystroke) {
  let keyup
  if (keyup = isKeyup(keystroke)) {
    keystroke = keystroke.slice(1)
  }
  const keys = parseKeystroke(keystroke)
  if (!keys) {
    return false
  }

  let primaryKey = null
  const modifiers = new Set()

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (MODIFIERS.has(key)) {
      modifiers.add(key)
    } else {
      // Only the last key can be a non-modifier
      if (i === (keys.length - 1)) {
        primaryKey = key
      } else {
        return false
      }
    }
  }

  if (keyup) {
    if (primaryKey != null) {
      primaryKey = primaryKey.toLowerCase()
    }
  } else {
    if (isUpperCaseCharacter(primaryKey)) {
      modifiers.add('shift')
    }
    if (modifiers.has('shift') && isLowerCaseCharacter(primaryKey)) {
      primaryKey = primaryKey.toUpperCase()
    }
  }

  keystroke = []
  if (!keyup || (keyup && (primaryKey == null))) {
    if (modifiers.has('ctrl')) {
      keystroke.push('ctrl')
    }
    if (modifiers.has('alt')) {
      keystroke.push('alt')
    }
    if (modifiers.has('shift')) {
      keystroke.push('shift')
    }
    if (modifiers.has('cmd')) {
      keystroke.push('cmd')
    }
  }
  if (primaryKey != null) {
    keystroke.push(primaryKey)
  }
  keystroke = keystroke.join('-')
  if (keyup) {
    keystroke = `^${keystroke}`
  }
  return keystroke
}

var parseKeystroke = function (keystroke) {
  const keys = []
  let keyStart = 0
  for (let index = 0; index < keystroke.length; index++) {
    const character = keystroke[index]
    if (character === '-') {
      if (index > keyStart) {
        keys.push(keystroke.substring(keyStart, index))
        keyStart = index + 1

        // The keystroke has a trailing - and is invalid
        if (keyStart === keystroke.length) {
          return false
        }
      }
    }
  }
  if (keyStart < keystroke.length) {
    keys.push(keystroke.substring(keyStart))
  }
  return keys
}

export default event => {
  let characters
  let {key, code, ctrlKey, altKey, shiftKey, metaKey} = event

  if (key === 'Dead') {
    if ((characters = __guard__(currentKeymaps, x => x[event.code]))) {
      if (altKey && shiftKey && (characters.withAltGraphShift != null)) {
        key = characters.withAltGraphShift
      } else if (altKey && (characters.withAltGraph != null)) {
        key = characters.withAltGraph
      } else if (shiftKey && (characters.withShift != null)) {
        key = characters.withShift
      } else if (characters.unmodified != null) {
        key = characters.unmodified
      }
    }
  }

  if ((NUMPAD_KEY_NAMES_BY_KEYBOARD_EVENT_CODE[code] != null) && event.getModifierState('NumLock')) {
    key = NUMPAD_KEY_NAMES_BY_KEYBOARD_EVENT_CODE[code]
  }

  if (KEY_NAMES_BY_KEYBOARD_EVENT_CODE[code] != null) {
    key = KEY_NAMES_BY_KEYBOARD_EVENT_CODE[code]
  }

  const isNonCharacterKey = key.length > 1
  if (isNonCharacterKey) {
    key = NON_CHARACTER_KEY_NAMES_BY_KEYBOARD_EVENT_KEY[key] != null ? NON_CHARACTER_KEY_NAMES_BY_KEYBOARD_EVENT_KEY[key] : key.toLowerCase()
  } else {
    // Deal with caps-lock issues. Key bindings should always adjust the
    // capitalization of the key based on the shiftKey state and never the state
    // of the caps-lock key
    if (shiftKey) {
      key = key.toUpperCase()
    } else {
      key = key.toLowerCase()
    }

    if (event.getModifierState('AltGraph') || altKey) {
      // All macOS layouts have an alt-modified character variant for every
      // single key. Therefore, if we always favored the alt variant, it would
      // become impossible to bind `alt-*` to anything. Since `alt-*` bindings
      // are rare and we bind very few by default on macOS, we will only shadow
      // an `alt-*` binding with an alt-modified character variant if it is a
      // basic ASCII character.
      let nonAltModifiedKey
      if (event.code) {
        nonAltModifiedKey = nonAltModifiedKeyForKeyboardEvent(event)
        if (nonAltModifiedKey && (ctrlKey || metaKey || !isASCIICharacter(key))) {
          key = nonAltModifiedKey
        } else if (key !== nonAltModifiedKey) {
          altKey = false
        }
      }
    }
  }


  let keystroke = ''
  if ((key === 'ctrl') || (ctrlKey && (event.type !== 'keyup'))) {
    keystroke += 'ctrl'
  }

  if ((key === 'alt') || (altKey && (event.type !== 'keyup'))) {
    if (keystroke.length > 0) {
      keystroke += '-'
    }
    keystroke += 'alt'
  }

  if ((key === 'shift') || (shiftKey && (event.type !== 'keyup') && (isNonCharacterKey || (isLatinCharacter(key) && isUpperCaseCharacter(key))))) {
    if (keystroke) {
      keystroke += '-'
    }
    keystroke += 'shift'
  }

  if ((key === 'cmd') || (metaKey && (event.type !== 'keyup'))) {
    if (keystroke) {
      keystroke += '-'
    }
    keystroke += 'cmd'
  }

  if (!MODIFIERS.has(key)) {
    if (keystroke) {
      keystroke += '-'
    }
    keystroke += key
  }

  if (event.type === 'keyup') {
    keystroke = normalizeKeystroke(`^${keystroke}`)
  }

  return keystroke
}

var nonAltModifiedKeyForKeyboardEvent = function (event) {
  let characters
  if (event.code && (characters = __guard__(currentKeymaps, x => x[event.code]))) {
    if (event.shiftKey) {
      return characters.withShift
    }
    return characters.unmodified
  }
}

const isKeyup = keystroke => keystroke.startsWith('^') && (keystroke !== '^')

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
