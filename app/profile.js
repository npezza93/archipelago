const Schema  = require('./schema')
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
    const coercer = new Coercer('name', this.attributes.name, defaultValue, schema)

    return coercer.coerce()
  }

  get attributes() {
    return this._attributes
  }

  get configFile() {
    return this._configFile
  }

  get schema() {
    return this._schema || (this._schema = new Schema)
  }

  set name(newName) {
    this.configFile.update(`profiles.${this.id}.name`, newName)

    return newName
  }

  destroy() {
    let currentContents = this._configFile.contents
    delete currentContents.profiles[this.id]

    return this.configFile.contents = currentContents
  }
}
