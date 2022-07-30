const fs = require('fs');
const {homedir} = require('os');
const {join} = require('path');
const Pref = require('pref');
const schema = require('../common/schema');

const pref = () => new Pref({
  schema,
  watch: false,
  migrations: {
    '5.0.0-beta1': store => {
      (store.store.profiles || []).forEach((profile, index) => {
        const background = store.get(`profiles.${index}.theme.selection`)

        if (background) {
          store.set(`profiles.${index}.theme.selectionBackground`, background);
          store.delete(`profiles.${index}.theme.selection`);
        }
      })
    },
    '5.0.0': store => {
      (store.store.profiles || []).forEach((profile, index) => {
        const background = store.get(`profiles.${index}.theme.selection`)

        if (background) {
          store.set(`profiles.${index}.theme.selectionBackground`, background);
          store.delete(`profiles.${index}.theme.selection`);
        }
      })
    },
    '3.0.0': store => {
      const filePath = join(homedir(), '.archipelago.json');
      if (fs.existsSync(filePath)) {
        const oldStore = JSON.parse(fs.readFileSync(filePath));
        const profiles = Object.values(oldStore.profiles);
        oldStore.profiles = profiles;
        store.store = oldStore;
      }

      (store.store.profiles || []).forEach((profile, index) => {
        if (store.get(`profiles.${index}.theme`) === undefined) {
          store.set(`profiles.${index}.theme`, {});
        }

        if (!['none', 'sound'].includes(store.get(`profiles.${index}.bellStyle`))) {
          store.set(`profiles.${index}.bellStyle`, 'sound');
        }
      });
    },
  },
});

module.exports = {pref};
