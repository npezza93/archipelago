/* global Notification */

const { pushKeyPath }       = require('key-path-helpers')
const { getValueAtKeyPath } = require('key-path-helpers')
const unescapeString        = require('unescape-js')
const Color                 = require('color')
const Schema                = require('./schema.js')

module.exports =
class Coercer {
  constructor(keyPath, currentValue, defaultValue, schema, options = null) {
    this.keyPath = keyPath
    this.currentValue = currentValue
    this.defaultValue = defaultValue
    this.schema = schema
    this.options = options
  }

  coerce() {
    return this[this.schema.type].call(this)
  }

  float() {
    const value = parseFloat(this.currentValue || this.defaultValue)

    if (isNaN(value) || !isFinite(value)) {
      throw this._canNotCoerce(this.currentValue || this.defaultValue)
    }

    return value
  }

  integer() {
    const value = parseInt(this.currentValue || this.defaultValue)

    if (isNaN(value) || !isFinite(value)) {
      throw this._canNotCoerce(this.currentValue || this.defaultValue)
    }

    return value
  }

  string() {
    return String(this.currentValue || this.defaultValue || '')
  }

  boolean() {
    let value = this.currentValue
    if ((value === undefined) || (value === null)) { value = this.defaultValue }

    switch (typeof value) {
    case 'string':
      if (value.toLowerCase() === 'true') {
        return true
      } else if (value.toLowerCase() === 'false') {
        return false
      } else {
        throw this._canNotCoerce(value)
      }
    case 'boolean':
      return value
    default:
      throw this._canNotCoerce(value)
    }
  }

  object() {
    const value = this.currentValue || this.defaultValue
    if (this.schema.properties == null) { return value }

    const newValue = {}
    for (let property in this.schema.properties) {
      let childSchema = this.schema.properties[property]
      if (childSchema != null) {
        try {
          const coercer = new Coercer(
            pushKeyPath(this.keyPath, property),
            getValueAtKeyPath(value, property),
            childSchema.defaultValue,
            childSchema,
            this.options
          )
          newValue[property] = coercer.coerce()
        } catch (error) {
          throw new Error(`Error setting item in object: ${error.message}`)
        }
      } else {
        throw new Error(`Illegal object key: ${this.keyPath}.${property}`)
      }
    }

    return newValue
  }

  rawString() {
    let value = this.string()

    if (!(this.options && this.options.keepEscaped)) {
      value = unescapeString(value)
    }

    return value
  }

  color() {
    const value = this.currentValue || this.defaultValue

    try {
      const parsedColor = new Color(value)
      return parsedColor.toString()
    } catch (error) {
      throw this._canNotCoerce(this.currentValue || this.defaultValue)
    }
  }

  array() {
    const value = this.currentValue || this.defaultValue

    if (!Array.isArray(value)) { this._canNotCoerce(value) }

    const itemSchema = this.schema.items
    if (itemSchema != null) {
      const newValue = []
      for (let item of value) {
        try {
          const coercer = new Coercer(this.keyPath, item, null, itemSchema, this.options)
          newValue.push(coercer.coerce())
        } catch (error) {
          this._canNotCoerce(`Error setting item in array: ${error.message}`)
        }
      }
      return newValue
    } else {
      return value
    }
  }

  _canNotCoerce(value) {
    return new Error(
      `Validation failed at ${this.keyPath}, ${JSON.stringify(value)} cannot be coerced into a ${this.schema.type}`
    )
  }

  _sendNotification(title, body, type) {
    if (Notification.permission === 'granted') {
      return new Notification(title, { body, icon: `../icons/${type}.png` })
    } else if (Notification.permission !== 'denied') {
      return Notification.requestPermission((permission) => {
        if (permission === 'granted') {
          return new Notification(title, { body, icon: `../icons/${type}.png` })
        }
      })
    }
  }
}
