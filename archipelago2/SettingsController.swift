import Cocoa
import WebKit

class SettingsController: NSViewController, WKUIDelegate, NSWindowDelegate {
  var webView: WKWebView!
  private lazy var url: URL = {
    URL(fileURLWithPath: Bundle.main.path(forResource: "settings", ofType: "html")!)
  }()

  override func loadView() {
    webView = WKWebView(
      frame: CGRect(x: 0, y: 0, width: 600, height: 600), configuration: .appConfiguration)

    webView.uiDelegate = self
    #if DEBUG
      webView.isInspectable = true
    #endif
    let overlay = DraggingView(frame: CGRect(x: 0, y: 0, width: webView.frame.width, height: 30))
    overlay.wantsLayer = true
    overlay.layer?.backgroundColor = NSColor.clear.cgColor
    webView.addSubview(overlay)

    view = webView
  }

  override func viewWillAppear() {
    super.viewWillAppear()
    self.view.window?.delegate = self
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    let path = self.url.deletingLastPathComponent()
    self.webView.loadFileURL(self.url, allowingReadAccessTo: path)
  }
}

