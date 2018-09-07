/* eslint guard-for-in: "off" */
/* global Notification */

const {pushKeyPath} = require('key-path-helpers')
const {getValueAtKeyPath} = require('key-path-helpers')
const unescapeString = require('unescape-js')
const Color = require('color')

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
    return this[this.schema.type]()
  }

  get usableValue() {
    let value = this.currentValue
    if ((value === undefined) || (value === null)) {
      value = this.defaultValue
    }

    return value
  }

  float() {
    const value = parseFloat(this.usableValue)

    if (isNaN(value) || !isFinite(value)) {
      throw this._canNotCoerce(this.usableValue)
    }

    return value
  }

  integer() {
    const value = parseInt(this.usableValue, 10)

    if (isNaN(value) || !isFinite(value)) {
      throw this._canNotCoerce(this.usableValue)
    }

    return value
  }

  string() {
    return String(this.usableValue || '')
  }

  boolean() {
    if (this.usableValue === 'false') {
      return false
    }

    return Boolean(this.usableValue)
  }

  object() {
    if (this.schema.properties === null) {
      return this.usableValue
    }

    const newValue = {}
    for (const property in this.schema.properties) {
      const childSchema = this.schema.properties[property]
      if (childSchema === null) {
        throw new Error(`Illegal object key: ${this.keyPath}.${property}`)
      } else {
        try {
          const coercer = new Coercer(
            pushKeyPath(this.keyPath, property),
            getValueAtKeyPath(this.usableValue, property),
            childSchema.defaultValue,
            childSchema,
            this.options
          )
          newValue[property] = coercer.coerce()
        } catch (error) {
          throw new Error(`Error setting item in object: ${error.message}`)
        }
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
    try {
      const parsedColor = new Color(this.usableValue)
      return parsedColor.toString()
    } catch (error) {
      throw this._canNotCoerce(this.usableValue)
    }
  }

  array() {
    if (!Array.isArray(this.usableValue)) {
      throw this._canNotCoerce(this.usableValue)
    }

    const itemSchema = this.schema.items
    if (itemSchema !== null) {
      const newValue = []
      for (const item of this.usableValue) {
        try {
          const coercer = new Coercer(this.keyPath, item, null, itemSchema, this.options)
          newValue.push(coercer.coerce())
        } catch (error) {
          this._canNotCoerce(`Error setting item in array: ${error.message}`)
        }
      }
      return newValue
    }
    return this.usableValue
  }

  _canNotCoerce(value) {
    return new Error(
      `Validation failed at ${this.keyPath}, ${JSON.stringify(value)} cannot be coerced into a ${this.schema.type}`
    )
  }

  _sendNotification(title, body, type) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {body, icon: `../icons/${type}.png`})
    }
    if (Notification.permission !== 'denied') {
      return Notification.requestPermission(permission => {
        if (permission === 'granted') {
          return new Notification(title, {body, icon: `../icons/${type}.png`})
        }
      })
    }
  }
}
