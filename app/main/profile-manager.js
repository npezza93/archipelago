import {BrowserWindow} from 'electron'
import {isDeepStrictEqual} from 'util'
import {platform} from 'electron-util'
import ipc from 'electron-better-ipc'
import Profile from './profile'

export default class ProfileManager {
  constructor(configFile) {
    this.configFile = configFile

    ipc.answerRenderer('single-tab-mode', () => this.get('singleTabMode'))
    ipc.answerRenderer('change-setting', ({property, value}) => {
      this.set(property, value)
      for (const window of BrowserWindow.getAllWindows()) {
        ipc.callRenderer(window, 'setting-changed', {property, value})
      }
    })
  }

  set activeProfileId(id) {
    this.configFile.set('activeProfileId', parseInt(id, 10))

    return parseInt(id, 10)
  }

  get rawProfiles() {
    return this.configFile.get('profiles') || []
  }

  get profileIds() {
    return this.rawProfiles.map(profile => profile.id)
  }

  any() {
    return this.profileIds.length > 0
  }

  activeProfile() {
    return this.find(this.configFile.get('activeProfileId'))
  }

  all() {
    return this.rawProfiles.map(profile => {
      return new Profile(profile, this.configFile)
    })
  }

  find(id) {
    return this.all().find(profile => profile.id === id)
  }

  create() {
    const id = Math.max(0, Math.max(...this.profileIds)) + 1
    const index = this.profileIds.length

    this.configFile.set(`profiles.${index}`, {id, keybindings: this.defaultKeybindings, theme: {}, visor: {}})
    this.configFile.set('activeProfileId', id)

    return this.find(id)
  }

  validate() {
    if (this.activeProfile() === undefined) {
      this.resetActiveProfile(this.profileIds[0])
    }

    this.all().forEach(profile => {
      if (profile.get('keybindings') === undefined) {
        profile.set('keybindings', this.defaultKeybindings)
      }
    })
  }

  get(keyPath) {
    return this.activeProfile().get(keyPath)
  }

  set(keyPath, value) {
    return this.activeProfile().set(keyPath, value)
  }

  onDidChange(keyPath, callback) {
    let oldValue = this.get(keyPath)

    const onChange = () => {
      const newValue = this.get(keyPath)
      if (!isDeepStrictEqual(oldValue, newValue)) {
        oldValue = newValue
        return callback(newValue)
      }
    }

    return this.configFile.events.on('change', onChange)
  }

  onActiveProfileChange(callback) {
    let oldValue = this.activeProfile()
    const disposable = this.configFile.onDidChange('activeProfileId', () => {
      const newValue = this.activeProfile()
      if (oldValue && newValue && oldValue.id !== newValue.id) {
        oldValue = newValue
        return callback(newValue)
      }
    })

    return disposable
  }

  onProfileChange(callback) {
    let oldValue = this.all().length
    const disposable = this.configFile.onDidChange('profiles', () => {
      const newValue = this.all().length
      if (oldValue && newValue) {
        oldValue = newValue
        return callback()
      }
    })

    return disposable
  }

  resetActiveProfile(newActiveProfileId) {
    if (this.any()) {
      this.activeProfileId = newActiveProfileId
    } else {
      this.configFile.set('profiles', [])
      this.create()
    }
  }

  get defaultKeybindings() {
    return platform({
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
  }
}
