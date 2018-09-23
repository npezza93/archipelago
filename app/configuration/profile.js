module.exports =
class Profile {
  constructor(attributes, configFile) {
    this.attributes = attributes
    this.configFile = configFile
  }

  get id() {
    return this.attributes.id
  }

  get index() {
    return this.configFile.get('profiles').findIndex(profile => {
      return profile.id === this.id
    })
  }

  get name() {
    return this.get('name')
  }

  set name(newName) {
    this.configFile.set(`profiles.${this.index}.name`, newName)
    this.attributes.name = newName

    return newName
  }

  destroy() {
    this.configFile.delete(`profiles.${this.index}`)

    return this.configFile.store
  }

  get(keyPath) {
    return this.configFile.get(`profiles.${this.index}.${keyPath}`)
  }

  set(keyPath, value) {
    return this.configFile.set(`profiles.${this.index}.${keyPath}`, value)
  }

  onDidChange(keyPath, callback) {
    let oldValue = this.get(keyPath)

    const disposable =
      this.configFile.onDidChange(`profiles.${this.index}.${keyPath}`, () => {
        const newValue = this.get(keyPath)
        if (oldValue !== newValue) {
          oldValue = newValue
          return callback(newValue)
        }
      })

    return disposable
  }
}
