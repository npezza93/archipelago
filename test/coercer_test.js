/* global describe, it */

const { assert }  = require('chai')
const Coercer      = require('../app/coercer')
const Schema       = require('../app/schema')

describe('Coercer', () => {
  describe('float', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key', '10.0', null, { type: 'float' }
      )

      assert.equal(coercer.coerce(), 10.0)
    })

    it('falls back to the default value', () => {
      const coercer = new Coercer(
        'key', null, '10.0', { type: 'float', defaultValue: '10.0' }
      )

      assert.equal(coercer.coerce(), 10.0)
    })

    it('throws an error when the value cannot be turned into a float', () => {
      const coercer = new Coercer('key', 'string', null, { type: 'float' })

      assert.throws(
        coercer.coerce.bind(coercer),
        Error,
        'Validation failed at key, "string" cannot be coerced into a float'
      )
    })
  })

  describe('integer', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key', '10', null, { type: 'integer' }
      )

      assert.equal(coercer.coerce(), 10)
    })

    it('falls back to the default value', () => {
      const coercer = new Coercer(
        'key', null, '10', { type: 'integer', defaultValue: '10' }
      )

      assert.equal(coercer.coerce(), 10)
    })

    it('throws an error when the value cannot be turned into a integer', () => {
      const coercer = new Coercer('key', 'string', null, { type: 'integer' })

      assert.throws(
        coercer.coerce.bind(coercer),
        Error,
        'Validation failed at key, "string" cannot be coerced into a integer'
      )
    })
  })

  describe('string', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key', 10, null, { type: 'string' }
      )

      assert.equal(coercer.coerce(), '10')
    })

    it('falls back to the default value', () => {
      const coercer = new Coercer(
        'key', null, 10, { type: 'integer', defaultValue: 10 }
      )

      assert.equal(coercer.coerce(), '10')
    })
  })

  describe('boolean', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key', 'true', null, { type: 'boolean' }
      )

      assert.equal(coercer.coerce(), true)
    })

    it('falls back to the default value', () => {
      const coercer = new Coercer(
        'key', null, false, { type: 'boolean', defaultValue: false }
      )

      assert.equal(coercer.coerce(), false)
    })

    it('throws an error when string cannot be coerced', () => {
      const coercer = new Coercer('key', 'string', null, { type: 'boolean' })

      assert.throws(
        coercer.coerce.bind(coercer),
        Error,
        'Validation failed at key, "string" cannot be coerced into a boolean'
      )
    })

    it('throws an error when anything but boolean or string are given', () => {
      const coercer = new Coercer('key', [], null, { type: 'boolean' })

      assert.throws(
        coercer.coerce.bind(coercer),
        Error,
        'Validation failed at key, [] cannot be coerced into a boolean'
      )
    })
  })

  describe('object', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key',
        { kidKey: '10' },
        null,
        {
          type: 'object',
          properties: { kidKey: { type: 'integer' } }
        }
      )

      assert.deepEqual(coercer.coerce(), { kidKey: 10 })
    })

    it('throws error if child properties cannot be coerced', () => {
      const coercer = new Coercer(
        'key',
        { child: '10' },
        null,
        {
          type: 'object',
          properties: { 'child': { 'type': 'boolean' } }
        }
      )

      assert.throws(
        coercer.coerce.bind(coercer),
        Error,
        'Error setting item in object: Validation failed at key.child, "10" cannot be coerced into a boolean'
      )
    })
  })

  describe('rawString', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key', '\\x1bOH', null, { type: 'rawString' }
      )

      assert.equal(coercer.coerce(), '\x1bOH')
    })

    it('skips unescaping the string', () => {
      const coercer = new Coercer(
        'key', '\\x1bOH', null, { type: 'rawString' }, { keepEscaped: true }
      )

      assert.equal(coercer.coerce(), '\\x1bOH')
    })

    it('falls back to the default value', () => {
      const coercer = new Coercer(
        'key', null, '\\x1bOH', { type: 'rawString', defaultValue: '\\x1bOH' }
      )

      assert.equal(coercer.coerce(), '\x1bOH')
    })
  })

  describe('color', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key', '#FFFFFF', null, { type: 'color' }
      )

      assert.equal(coercer.coerce(), 'rgb(255, 255, 255)')
    })

    it('falls back to the default value', () => {
      const coercer = new Coercer(
        'key', null, '#ffffff', { type: 'color', defaultValue: '#ffffff' }
      )

      assert.equal(coercer.coerce(), 'rgb(255, 255, 255)')
    })

    it('throws error if the color cannot be parsed', () => {
      const coercer = new Coercer(
        'key', 'rando-string', null, { type: 'color'}
      )

      assert.throws(
        coercer.coerce.bind(coercer),
        Error,
        'Validation failed at key, "rando-string" cannot be coerced into a color'
      )
    })
  })

  describe('array', () => {
    it('coerces the current value', () => {
      const coercer = new Coercer(
        'key',
        [{ keystroke: 'cmd-left', command: '10' }],
        null,
        {
          type: 'array', items: {
            type: 'object', properties: {
              keystroke: { type: 'string' }, command: { type: 'integer' }
            }
          }
        }
      )

      assert.deepEqual(
        coercer.coerce(),
        [{ 'keystroke': 'cmd-left', 'command': 10 }]
      )
    })
  })
})
