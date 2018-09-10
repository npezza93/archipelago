const {Disposable} = require('event-kit')

const Schema = require('./schema')
const Coercer = require('./coercer')

module.exports =
class Profile {
  constructor(attributes, configFile) {
    this.attributes = attributes
    this.configFile = configFile
  }

  get id() {
    return this.attributes.id
  }

  get name() {
    const schema = this.schema.getSchema('name')
    const defaultValue = this.schema.defaultValue('name')
    const coercer = new Coercer('name', this.attributes.name || defaultValue, schema)

    return coercer.coerce()
  }

  get schema() {
    if (this._schema === undefined) {
      this._schema = new Schema()
    }

    return this._schema
  }

  set name(newName) {
    this.configFile.set(`profiles.${this.id}.name`, newName)

    return newName
  }

  destroy() {
    this.configFile.delete(`profiles.${this.id}`)

    return this.configFile.store
  }

  get(keyPath, options) {
    const schema = this.schema.getSchema(keyPath)

    let configKeyPath = `profiles.${this.id}.${keyPath}`
    if (schema.platformSpecific) {
      configKeyPath += `.${process.platform}`
    }

    const value = this.configFile.get(
      configKeyPath, this.schema.defaultValue(keyPath)
    )

    const coercer = new Coercer(keyPath, value, schema, options)
    return coercer.coerce()
  }

  set(keyPath, value) {
    const schema = this.schema.getSchema(keyPath)

    keyPath = `profiles.${this.id}.${keyPath}`
    if (schema.platformSpecific) {
      keyPath += `.${process.platform}`
    }

    return this.configFile.set(keyPath, value)
  }

  onDidChange(keyPath, callback) {
    let oldValue = this.get(keyPath)

    const onChange =
      this.configFile.onDidChange(`profiles.${this.id}.${keyPath}`, () => {
        const newValue = this.get(keyPath)
        if (oldValue !== newValue) {
          oldValue = newValue
          return callback(newValue)
        }
      })

    return new Disposable(() => onChange.call())
  }
}
