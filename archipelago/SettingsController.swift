import Cocoa
import Strada
import WebKit

class SettingsController: NSViewController, WKUIDelegate, NSWindowDelegate, BridgeDestination {
  var webView: WKWebView!
  private lazy var url: URL = {
    URL(fileURLWithPath: Bundle.main.path(forResource: "settings", ofType: "html")!)
  }()
  private lazy var bridgeDelegate: BridgeDelegate = {
    BridgeDelegate(
      location: "archipelago-1",
      destination: self,
      componentTypes: BridgeComponent.allTypes)
  }()

  override func loadView() {
    webView = WKWebView(
      frame: CGRect(x: 0, y: 0, width: 650, height: 600), configuration: .appConfiguration)

    webView.uiDelegate = self
    #if DEBUG
      webView.isInspectable = true
    #endif
    let overlay = DraggingView(frame: CGRect(x: 0, y: 0, width: webView.frame.width, height: 30))
    overlay.wantsLayer = true
    overlay.layer?.backgroundColor = NSColor.clear.cgColor
    webView.addSubview(overlay)

    view = webView
    Bridge.initialize(webView)
  }

  override func viewWillAppear() {
    super.viewWillAppear()
    bridgeDelegate.onViewWillAppear()
    self.view.window?.delegate = self
    bridgeDelegate.webViewDidBecomeActive(webView)
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    let path = self.url.deletingLastPathComponent()
    self.webView.loadFileURL(self.url, allowingReadAccessTo: path)
    bridgeDelegate.onViewDidLoad()
  }
}
