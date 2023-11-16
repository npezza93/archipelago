import Cocoa
import UserNotifications

class ImportSettingsMenuItem: NSMenuItem {

  override init(title string: String, action selector: Selector?, keyEquivalent charCode: String) {
    super.init(title: string, action: selector, keyEquivalent: charCode)
    commonInit()
  }

  required init(coder: NSCoder) {
    super.init(coder: coder)
    commonInit()
  }

  private func commonInit() {
    self.target = self
    self.action = #selector(importSettingsAction)
  }

  @objc private func importSettingsAction() {
    let openPanel = NSOpenPanel()
    openPanel.title = "Import Settings"

    openPanel.begin { response in
      if response == .OK, let url = openPanel.url {
        var content: UNMutableNotificationContent? = nil
        do {
          let data = try Data(contentsOf: url)
          let config = try JSONDecoder().decode(Config.self, from: data)
          App.preferenceFile.importConfig(config)
          content = UNMutableNotificationContent()
          content?.title = "Settings imported!"
        } catch {
          content = UNMutableNotificationContent()
          content?.title = "Import Error"
          content?.body = "The settings file is malformed or incompatible."
        }

        if let notif = content {
          let request = UNNotificationRequest(
            identifier: UUID().uuidString, content: notif, trigger: nil)
          UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
        }
      }
    }
  }
}
