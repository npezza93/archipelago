const fs = require('fs')
const {homedir} = require('os')
const {join} = require('path')
const {platform} = require('electron-util')
const Pref = require('pref')

const schema = require('./schema.json')

const pref = () => {
  return new Pref({
    schema,
    migrations: {
      '3.0.0': store => {
        const filePath = join(homedir(), '.archipelago.json')
        if (fs.existsSync(filePath)) {
          const oldStore = JSON.parse(fs.readFileSync(filePath))
          const profiles = Object.values(oldStore.profiles)
          oldStore.profiles = profiles
          store.store = oldStore
        }

        (store.store.profiles || []).forEach((profile, index) => {
          if (store.get(`profiles.${index}.theme`) === undefined) {
            store.set(`profiles.${index}.theme`, {})
          }

          if (store.get(`profiles.${index}.visor`) === undefined) {
            store.set(`profiles.${index}.visor`, {})
          }
        })
      }
    }
  })
}

const keybindings = platform({
  linux: [
    {keystroke: 'home', command: '\\x1bOH'},
    {keystroke: 'end', command: '\\x1bOF'},
    {keystroke: 'ctrl-backspace', command: '\\x1b\\x08'},
    {keystroke: 'ctrl-del', command: '\\x1bd'},
    {keystroke: 'ctrl-home', command: '\\x1bw'},
    {keystroke: 'ctrl-end', command: '\\x10B'}
  ],
  windows: [
    {keystroke: 'home', command: '\\x1bOH'},
    {keystroke: 'end', command: '\\x1bOF'},
    {keystroke: 'ctrl-backspace', command: '\\x1b\\x08'},
    {keystroke: 'cltr-del', command: '\\x1bd'},
    {keystroke: 'ctrl-home', command: '\\x1bw'},
    {keystroke: 'ctrl-end', command: '\\x10B'}
  ],
  macos: [
    {keystroke: 'cmd-left', command: '\\x1bOH'},
    {keystroke: 'cmd-right', command: '\\x1bOF'},
    {keystroke: 'alt-delete', command: '\\x1bd'},
    {keystroke: 'cmd-backspace', command: '\\x1bw'},
    {keystroke: 'cmd-delete', command: '\\x10B'}
  ]
})

const allProperties = schema.properties.profiles.items.properties

const xtermSettings = Object.keys(allProperties).filter(property => {
  return allProperties[property].scope === 'xterm'
})

module.exports = {pref, xtermSettings, keybindings}
