const { splitKeyPath } = require('key-path-helpers')
const { pushKeyPath }  = require('key-path-helpers')
const rootSchema       = require('./schema.json')

module.exports =
class Schema {
  constructor(schema = null) {
    this.schema = schema || { 'type': 'object', 'properties': rootSchema }
  }

  get type() {
    return this.schema.type
  }

  get properties() {
    return this.schema.properties
  }

  get items() {
    return this.schema.items
  }

  propertiesGroupedBySetting() {
    const propertiesBySetting = {}

    const properties = this._childPropertiesFromSchema(this.schema)
    for (let property in properties) {
      const { settings } = properties[property]
      if (propertiesBySetting[settings.title] == null) {
        propertiesBySetting[settings.title] = []
      }
      propertiesBySetting[settings.title].push(
        { [property]: properties[property] }
      )
    }

    return propertiesBySetting
  }

  defaultValue(keyPath) {
    const childSchema = this.getSchema(keyPath)
    let value

    if (childSchema.type === 'object') {
      value = this._objectDefaultValue(keyPath, childSchema)
    } else {
      value = this._topLevelDefaultValue(childSchema)
    }

    return value
  }

  getSchema(keyPath) {
    const keys = splitKeyPath(keyPath)
    let { schema } = this

    for (let key of keys) {
      let childSchema
      if (schema.type === 'object') {
        childSchema = schema.properties[key]
        schema = childSchema
      }
    }

    if (this.isEnabled(schema)) { return schema }
  }

  isEnabled(schema) {
    const defaultPlatforms = ['linux', 'win32', 'darwin']

    return (schema.enabledOn || defaultPlatforms).includes(process.platform)
  }

  // private

  _objectDefaultValue(keyPath, childSchema) {
    const defaults = {}

    for (let key in (childSchema.properties || {})) {
      defaults[key] = this.defaultValue(pushKeyPath(keyPath, key))
    }

    return defaults
  }

  _topLevelDefaultValue(childSchema) {
    const { defaultValue, platformSpecific } = childSchema

    if (defaultValue != undefined && platformSpecific) {
      return defaultValue[process.platform]
    } else {
      return defaultValue
    }
  }

  _childPropertiesFromSchema(schema, keyPath = null) {
    if (schema.type === 'object') {
      const properties = {}
      const object = schema.properties || {}
      for (let childKeyPath in object) {
        const childSchema = object[childKeyPath]
        const propertyKeyPath = pushKeyPath(keyPath, childKeyPath)
        const childProperties = this._childPropertiesFromSchema(childSchema, propertyKeyPath)
        Object.assign(properties, childProperties)
      }
      return properties
    } else if (this.isEnabled(schema)) {
      return { [keyPath]: schema }
    }
  }
}
