import Cocoa
import UserNotifications

class NewWindowMenuItem: NSMenuItem {

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
    self.action = #selector(createWindowAction)
  }

  @objc func createWindowAction() {
    let storyboard = NSStoryboard(name: "Main", bundle: nil)
    let windowControllerIdentifier = "TerminalWindowController"
    if let windowController = storyboard.instantiateController(
      withIdentifier: windowControllerIdentifier) as? NSWindowController
    {
      windowController.showWindow(self)
    }
  }
}
