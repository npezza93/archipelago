import Cocoa
import Strada
import WebKit

class ViewController: NSViewController, WKUIDelegate, NSWindowDelegate, BridgeDestination {
  var webView: WKWebView!
  private lazy var url: URL = {
    URL(fileURLWithPath: Bundle.main.path(forResource: "index", ofType: "html")!)
  }()
  private lazy var bridgeDelegate: BridgeDelegate = {
    BridgeDelegate(
      location: "archipelago-1",
      destination: self,
      componentTypes: BridgeComponent.allTypes)
  }()

  override func loadView() {
    webView = WKWebView(
      frame: CGRect(x: 0, y: 0, width: 800, height: 600), configuration: .appConfiguration)

    webView.configuration.preferences.setValue(true, forKey: "developerExtrasEnabled")

    let script = WKUserScript(
      source: monospsaceFontStylesheet(), injectionTime: .atDocumentStart, forMainFrameOnly: true)
    webView.configuration.userContentController.addUserScript(script)

    webView.setValue(false, forKey: "drawsBackground")

    let overlay = DraggingView(frame: CGRect(x: 0, y: 0, width: webView.frame.width, height: 30))
    overlay.wantsLayer = true
    overlay.layer?.backgroundColor = NSColor.clear.cgColor
    webView.addSubview(overlay)

    webView.uiDelegate = self
    webView.navigationDelegate = self
    #if DEBUG
      webView.isInspectable = true
    #endif
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
    self.view = webView
    bridgeDelegate.onViewDidLoad()
  }

  override var representedObject: Any? {
    didSet {
      // Update the view, if already loaded.
    }
  }

  func windowWillClose(_ notification: Notification) {
    bridgeDelegate.onViewWillDisappear()
  }

  private func monospsaceFontStylesheet() -> String {
    return """
      document.addEventListener('DOMContentLoaded', () => {
          window.fonts = \(App.fonts.map { $0.as_json() })
      });
      """
  }
}

extension ViewController: WKNavigationDelegate {
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
