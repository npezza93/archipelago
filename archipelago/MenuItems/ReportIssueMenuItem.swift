import Cocoa

class ReportIssueMenuItem: NSMenuItem {

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
    self.action = #selector(reportIssueAction)
  }

  @objc private func reportIssueAction() {
    let url =
      "https://github.com/npezza93/archipelago/issues/new?assignees=npezza93&labels=bug&template=bug_report.md"
    NSWorkspace.shared.open(URL(string: url)!)
  }
}
