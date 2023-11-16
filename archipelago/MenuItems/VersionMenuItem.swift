import Cocoa

class VersionMenuItem: NSMenuItem {

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
    if let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") {
      self.title = "Version \(version)"
    }
  }
}
