const { assert } = require('chai');
const Schema = require('../app/schema');

describe('Schema', () => {
  describe('property', () => {
    const oldPlatform = process.platform;
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
    });

    after(() => {
      Object.defineProperty(process, 'platform', { value: oldPlatform });
    });

    it('is enabled on the specified platform', () => {
      let schema = new Schema;
      let property = {
        'property': {
          'type': 'boolean',
          'defaultValue': true,
          'enabledOn': ['darwin']
        }
      }
      assert(schema.isEnabled(property['property']));
    });

    it('is enabled by default', () => {
      let schema = new Schema;
      let property = {
        'property': {
          'type': 'boolean',
          'defaultValue': true
        }
      }

      Object.defineProperty(process, 'platform', { value: 'linux' });
      assert(schema.isEnabled(property['property']));
    });

    it('is disabled on the wrong platform', () => {
      let schema = new Schema;
      let property = {
        'property': {
          'type': 'boolean',
          'defaultValue': true,
          'enabledOn': ['darwin']
        }
      }

      Object.defineProperty(process, 'platform', { value: 'linux' });
      assert.isFalse(schema.isEnabled(property['property']));
    });
  });

  describe('getSchema', () => {
    it('traverses the schema to get nested property schemas', () => {
      let schema = new Schema;

      assert.deepEqual(
        schema.getSchema('theme.foreground'),
        {
          "type": "color",
          "defaultValue": "#FFFFFF",
          "settings": {
            "title": "theme",
            "group": 1,
            "order": 5
          }
        }
      )
    });

    it('gets top level properties', () => {
      let schema = new Schema;

      assert.deepEqual(
        schema.getSchema('name'),
        {
          "type": "string",
          "defaultValue": "New Profile",
          "settings": {
            "title": "profile"
          }
        }
      )
    });

    it('returns nothing if the property is not enabled', () => {
      let schema = new Schema;

      Object.defineProperty(process, 'platform', { value: 'linux' });

      assert.isUndefined(schema.getSchema('macOptionIsMeta'));

      Object.defineProperty(process, 'platform', { value: 'darwin' });
    });
  });

  describe('getDefaultValue', () => {
  });
});
