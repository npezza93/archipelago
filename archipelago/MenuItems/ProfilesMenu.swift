import Cocoa

class ProfilesMenu: NSMenu {

  override init(title: String) {
    super.init(title: title)
    createMenuItems()
  }

  required init(coder: NSCoder) {
    super.init(coder: coder)
    createMenuItems()
  }

  func createMenuItems() {
    self.removeAllItems()
    for profile in App.preferenceFile.config.profiles {
      let item = NSMenuItem(
        title: profile.name, action: #selector(profileSelected(_:)), keyEquivalent: "")
      item.target = self
      item.representedObject = profile.id
      if profile.id == App.preferenceFile.activeProfile().id {
        item.state = .on
      } else {
        item.state = .off
      }

      self.addItem(item)
    }
  }

  @objc private func profileSelected(_ sender: NSMenuItem) {
    let id = sender.representedObject as! UInt32
    App.preferenceFile.updateActiveProfile(id: id)
  }
}
