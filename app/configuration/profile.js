const Schema = require('./schema')
const Coercer = require('./coercer')

module.exports =
class Profile {
  constructor(attributes, configFile) {
    this._attributes = attributes
    this._configFile = configFile
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

  get attributes() {
    return this._attributes
  }

  get configFile() {
    return this._configFile
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
}
