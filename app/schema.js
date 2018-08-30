const CSON                  = require('season');
const { join }              = require('path');
const { getValueAtKeyPath } = require('key-path-helpers');
const { splitKeyPath }      = require('key-path-helpers');
const { pushKeyPath }       = require('key-path-helpers');
const rootSchema            = require('./schema.json')

module.exports =
class Schema {
  constructor() {
    this.schema = { 'type': 'object', 'properties': rootSchema };
  }

  settingsScopes() {
    const settings = {};

    const object = this.editableProperties();
    for (let property in object) {
      const schema = object[property];
      if (settings[schema.settings.title] == null) {
        settings[schema.settings.title] = [];
      }
      settings[schema.settings.title].push({[property]: schema});
    }

    return settings;
  }

  getPropertyFromSchema(keyPath, schema) {
    if (schema.type === 'object') {
      const properties = {};
      const object = schema.properties || {};
      for (let childKeyPath in object) {
        const childSchema = object[childKeyPath];
        const propertyKeyPath = pushKeyPath(keyPath, childKeyPath);
        const childProperties = this.getPropertyFromSchema(propertyKeyPath, childSchema);
        Object.assign(properties, childProperties);
      }
      return properties;
    } else if (this.isEnabled(schema)) {
      return { [keyPath]: schema };
    }
  }

  defaultValue(keyPath) {
    const childSchema = this.getSchema(keyPath);
    let value;

    if (childSchema.type === 'object') {
      value = this._objectDefaultValue(keyPath, childSchema);
    } else {
      value = this._topLevelDefaultValue(childSchema);
    }

    return value;
  }

  getSchema(keyPath) {
    const keys = splitKeyPath(keyPath);
    let { schema } = this;

    for (let key of keys) {
      let childSchema;
      if (schema.type === 'object') {
        childSchema = schema.properties[key];
      }
      schema = childSchema;
    }

    if (this.isEnabled(schema)) { return schema; }
  }

  isEnabled(schema) {
    const defaultPlatforms = ['linux', 'win32', 'darwin'];

    return (schema.enabledOn || defaultPlatforms).includes(process.platform);
  }

  editableProperties() {
    return this.getPropertyFromSchema('', this.schema)
  }

  // private

  _objectDefaultValue(keyPath, childSchema) {
    const defaults = {};

    for (let key in (childSchema.properties || {})) {
      defaults[key] = this.defaultValue(pushKeyPath(keyPath, key));
    }

    return defaults;
  }

  _topLevelDefaultValue(childSchema) {
    const { defaultValue, platformSpecific } = childSchema;

    if (defaultValue != undefined && platformSpecific) {
      return defaultValue[process.platform];
    } else {
      return defaultValue;
    }
  }
};
