/* eslint guard-for-in: "off" */
/* global Notification */

const {pushKeyPath} = require('key-path-helpers')
const {getValueAtKeyPath} = require('key-path-helpers')
const unescapeString = require('unescape-js')
const Color = require('color')

module.exports =
class Coercer {
  constructor(keyPath, currentValue, schema, options = null) {
    this.keyPath = keyPath
    this.currentValue = currentValue
    this.schema = schema
    this.options = options
  }

  coerce() {
    return this[this.schema.type]()
  }

  float() {
    const value = parseFloat(this.currentValue)

    if (isNaN(value) || !isFinite(value)) {
      throw this._canNotCoerce(this.currentValue)
    }

    return value
  }

  integer() {
    const value = parseInt(this.currentValue, 10)

    if (isNaN(value) || !isFinite(value)) {
      throw this._canNotCoerce(this.currentValue)
    }

    return value
  }

  string() {
    return String(this.currentValue || '')
  }

  boolean() {
    if (this.currentValue === 'false') {
      return false
    }

    return Boolean(this.currentValue)
  }

  object() {
    if (this.schema.properties === null) {
      return this.currentValue
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
            getValueAtKeyPath(this.currentValue, property) || childSchema.defaultValue,
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
      const parsedColor = new Color(this.currentValue)
      return parsedColor.toString()
    } catch (error) {
      throw this._canNotCoerce(this.currentValue)
    }
  }

  array() {
    if (!Array.isArray(this.currentValue)) {
      throw this._canNotCoerce(this.currentValue)
    }

    const itemSchema = this.schema.items
    if (itemSchema !== null) {
      const newValue = []
      for (const item of this.currentValue) {
        try {
          const coercer = new Coercer(this.keyPath, item, itemSchema, this.options)
          newValue.push(coercer.coerce())
        } catch (error) {
          this._canNotCoerce(`Error setting item in array: ${error.message}`)
        }
      }
      return newValue
    }
    return this.currentValue
  }

  _canNotCoerce(value) {
    return new Error(
      `Validation failed at ${this.keyPath}, ${JSON.stringify(value)} cannot be coerced into a ${this.schema.type}`
    )
  }

  _sendNotification(title, body, type) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {body, icon: `../images/${type}.png`})
    }
    if (Notification.permission !== 'denied') {
      return Notification.requestPermission(permission => {
        if (permission === 'granted') {
          return new Notification(title, {body, icon: `../images/${type}.png`})
        }
      })
    }
  }
}
