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
      frame: CGRect(x: 0, y: 0, width: 650, height: 283), configuration: .appConfiguration)

    webView.setValue(false, forKey: "drawsBackground")

    webView.uiDelegate = self
    webView.navigationDelegate = self
    #if DEBUG
      webView.configuration.preferences.setValue(true, forKey: "developerExtrasEnabled")
      webView.isInspectable = true
    #endif
    view = webView
    Bridge.initialize(webView)

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

  func windowWillClose(_ notification: Notification) {
    bridgeDelegate.onViewWillDisappear()
  }

  func webView(
    _ webView: WKWebView,
    runJavaScriptConfirmPanelWithMessage message: String,
    initiatedByFrame frame: WKFrameInfo,
    completionHandler: @escaping (Bool) -> Void
  ) {
    let alert = NSAlert()
    alert.messageText = message
    alert.addButton(withTitle: "OK")
    alert.addButton(withTitle: "Cancel")

    let action = alert.runModal()

    completionHandler(action == .alertFirstButtonReturn)
  }
}

extension SettingsController: WKNavigationDelegate {
  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    print("Failed navigation: \(error.localizedDescription)")
  }

  func webView(
    _ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!,
    withError error: Error
  ) {
    print("Failed provisional navigation: \(error.localizedDescription)")
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
  }

  func webView(
    _ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
    for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures
  ) -> WKWebView? {
    if let url = navigationAction.request.url {
      NSWorkspace.shared.open(url)
    }
    return nil
  }
}
