import Cocoa

class ExportSettingsMenuItem: NSMenuItem {

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
    self.action = #selector(exportSettingsAction)
  }

  @objc private func exportSettingsAction() {
    let savePanel = NSSavePanel()
    savePanel.title = "Export Settings"
    savePanel.nameFieldStringValue = "archipelago-settings.json"

    savePanel.begin { response in
      if response == .OK, let url = savePanel.url {
        try! App.preferenceFile.asJson().data(using: .utf8)?.write(to: url)
      }
    }
  }
}
