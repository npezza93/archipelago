/* eslint guard-for-in: "off" */

const {splitKeyPath} = require('key-path-helpers')
const {pushKeyPath} = require('key-path-helpers')
const rootSchema = require('./schema.json')

module.exports =
class Schema {
  constructor(schema = null) {
    this.schema = schema || {type: 'object', properties: rootSchema}
  }

  propertiesGroupedBySetting() {
    const propertiesBySetting = {}

    const properties = this.childPropertiesFromSchema(this.schema)
    for (const property in properties) {
      const {settings} = properties[property]
      if (propertiesBySetting[settings.title] === null ||
          propertiesBySetting[settings.title] === undefined) {
        propertiesBySetting[settings.title] = []
      }
      propertiesBySetting[settings.title].push(
        {[property]: properties[property]}
      )
    }

    return propertiesBySetting
  }

  defaultValue(keyPath) {
    const childSchema = this.getSchema(keyPath)
    let value

    if (childSchema.type === 'object') {
      value = this.objectDefaultValue(keyPath, childSchema)
    } else {
      value = this.topLevelDefaultValue(childSchema)
    }

    return value
  }

  getSchema(keyPath) {
    const keys = splitKeyPath(keyPath)
    let {schema} = this

    for (const key of keys) {
      let childSchema
      if (schema.type === 'object') {
        childSchema = schema.properties[key]
        schema = childSchema
      }
    }

    if (this.isEnabled(schema)) {
      return schema
    }
  }

  isEnabled(schema) {
    const defaultPlatforms = ['linux', 'win32', 'darwin']

    return (schema.enabledOn || defaultPlatforms).includes(process.platform)
  }

  objectDefaultValue(keyPath, childSchema) {
    const defaults = {}

    for (const key in (childSchema.properties || {})) {
      defaults[key] = this.defaultValue(pushKeyPath(keyPath, key))
    }

    return defaults
  }

  topLevelDefaultValue(childSchema) {
    const {defaultValue, platformSpecific} = childSchema

    if (defaultValue !== undefined && platformSpecific) {
      return defaultValue[process.platform]
    }
    return defaultValue
  }

  childPropertiesFromSchema(schema, keyPath = null) {
    if (schema.type === 'object') {
      const properties = {}
      const object = schema.properties || {}
      for (const childKeyPath in object) {
        const childSchema = object[childKeyPath]
        const propertyKeyPath = pushKeyPath(keyPath, childKeyPath)
        const childProperties = this.childPropertiesFromSchema(childSchema, propertyKeyPath)
        Object.assign(properties, childProperties)
      }
      return properties
    }

    if (this.isEnabled(schema)) {
      return {[keyPath]: schema}
    }
  }
}
