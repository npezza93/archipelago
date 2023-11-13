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
    var stylesheet = ""

    for (fontName, fontPath) in App.fonts {
      if let fontData = try? Data(contentsOf: URL(fileURLWithPath: fontPath)) {
        let base64FontData = fontData.base64EncodedString()
        let cssFontFace = """
          @font-face {
              font-family: '\(fontName)';
              src: url(data:font/truetype;base64,\(base64FontData));
          }
          """
        stylesheet += cssFontFace + "\n\n"
      }
    }

    // Escape newlines and single quotes for JavaScript
    let escapedStylesheet = stylesheet.replacingOccurrences(of: "\n", with: "\\n")
      .replacingOccurrences(of: "'", with: "\\'")

    return """
      document.addEventListener('DOMContentLoaded', () => {
          var style = document.createElement('style');
          style.innerHTML = '\(escapedStylesheet)';
          document.head.appendChild(style);
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
