/* global describe, it, before, after */

const { assert }  = require('chai')
const Schema      = require('../app/schema')
const oldPlatform = process.platform

describe('Schema', () => {
  describe('property', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'darwin' })
    })

    after(() => {
      Object.defineProperty(process, 'platform', { value: oldPlatform })
    })

    it('is enabled on the specified platform', () => {
      let schema = new Schema
      let property = {
        'property': {
          'type': 'boolean',
          'defaultValue': true,
          'enabledOn': ['darwin']
        }
      }
      assert(schema.isEnabled(property['property']))
    })

    it('is enabled by default', () => {
      let schema = new Schema
      let property = {
        'property': {
          'type': 'boolean',
          'defaultValue': true
        }
      }

      Object.defineProperty(process, 'platform', { value: 'linux' })
      assert(schema.isEnabled(property['property']))
    })

    it('is disabled on the wrong platform', () => {
      let schema = new Schema
      let property = {
        'property': {
          'type': 'boolean',
          'defaultValue': true,
          'enabledOn': ['darwin']
        }
      }

      Object.defineProperty(process, 'platform', { value: 'linux' })
      assert.isFalse(schema.isEnabled(property['property']))
    })
  })

  describe('getSchema', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'darwin' })
    })

    after(() => {
      Object.defineProperty(process, 'platform', { value: oldPlatform })
    })

    it('traverses the schema to get nested property schemas', () => {
      let schema = new Schema

      assert.deepEqual(
        schema.getSchema('theme.foreground'),
        {
          'type': 'color',
          'defaultValue': '#FFFFFF',
          'settings': {
            'title': 'theme',
            'group': 1,
            'order': 5
          }
        }
      )
    })

    it('gets top level properties', () => {
      let schema = new Schema

      assert.deepEqual(
        schema.getSchema('name'),
        {
          'type': 'string',
          'defaultValue': 'New Profile',
          'settings': {
            'title': 'profile'
          }
        }
      )
    })

    it('returns nothing if the property is not enabled', () => {
      let schema = new Schema

      Object.defineProperty(process, 'platform', { value: 'linux' })

      assert.isUndefined(schema.getSchema('macOptionIsMeta'))
    })
  })

  describe('getDefaultValue', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'darwin' })
    })

    after(() => {
      Object.defineProperty(process, 'platform', { value: oldPlatform })
    })

    it('is undefined when there is no defined defaultValue', () => {
      let schema = new Schema

      assert.isUndefined(schema.defaultValue('shell'))
    })

    it('fetches the default value for normal types', () => {
      let schema = new Schema

      assert.equal(schema.defaultValue('shellArgs'), '--login')
    })

    it('fetches the default value all properties in an object type', () => {
      let schema = new Schema
      let defaultTheme = {
        selection: 'rgba(255, 255, 255, 0.3)', foreground: '#FFFFFF',
        background: '#000000', black: '#000000', red: '#ff5c57',
        brightRed: '#ff5c57', green: '#5af78e', brightGreen: '#5af78e',
        yellow: '#f3f99d', brightYellow: '#f3f99d', magenta: '#ff6ac1',
        brightMagenta: '#ff6ac1', cyan: '#5fcbd8', brightCyan: '#5fcbd8',
        blue: '#57c7ff', brightBlue: '#57c7ff', white: '#ffffff',
        brightWhite: '#FFFFFF', brightBlack: '#808080', cursorAccent: '#000000',
        cursor: '#FFFFFF'
      }
      assert.deepEqual(schema.defaultValue('theme'), defaultTheme)
    })

    it('fetches the default value for platform specific properties', () => {
      let schema = new Schema
      let defaultKeybindings = [
        { keystroke: 'cmd-left', command: '\\x1bOH' },
        { keystroke: 'cmd-right', command: '\\x1bOF' },
        { keystroke: 'alt-delete', command: '\\x1bd' },
        { keystroke: 'cmd-backspace', command: '\\x1bw' },
        { keystroke: 'cmd-delete', command: '\\x10B' }
      ]

      assert.deepEqual(schema.defaultValue('keybindings'), defaultKeybindings)
    })
  })

  describe('propertiesGroupedBySetting', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'darwin' })
    })

    after(() => {
      Object.defineProperty(process, 'platform', { value: oldPlatform })
    })

    it('groups all properties by their setting', () => {
      let schema = new Schema
      let settings = [
        'profile', 'font', 'cursor', 'bell', 'shell', 'vibrancy', 'modes',
        'theme', 'keybindings'
      ]

      assert.deepEqual(
        Object.keys(schema.propertiesGroupedBySetting()), settings
      )
    })
  })
})
