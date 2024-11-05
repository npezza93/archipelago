import Cocoa
@preconcurrency import WebKit

class AboutController: NSViewController, WKUIDelegate, NSWindowDelegate, WKNavigationDelegate {
  var webView: WKWebView!
  private lazy var url: URL = {
    URL(fileURLWithPath: Bundle.main.path(forResource: "about", ofType: "html")!)
  }()

  override func loadView() {
    webView = WKWebView(
      frame: CGRect(x: 0, y: 0, width: 300, height: 500), configuration: .appConfiguration)

    webView.setValue(false, forKey: "drawsBackground")
    webView.uiDelegate = self
    webView.navigationDelegate = self
    #if DEBUG
      webView.configuration.preferences.setValue(true, forKey: "developerExtrasEnabled")
      webView.isInspectable = true
    #endif
    let overlay = DraggingView(frame: CGRect(x: 0, y: 0, width: webView.frame.width, height: 30))
    overlay.wantsLayer = true
    overlay.layer?.backgroundColor = NSColor.clear.cgColor
    webView.addSubview(overlay)

    view = webView

    let visualEffectView = NSVisualEffectView()
    visualEffectView.material = .popover
    visualEffectView.blendingMode = .behindWindow
    visualEffectView.state = .active
    visualEffectView.frame = view.bounds  // Set the frame to cover the entire view
    visualEffectView.autoresizingMask = [.width, .height]  // Ensure it resizes with the window
    view.addSubview(visualEffectView, positioned: .below, relativeTo: webView)
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

  func webView(
    _ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
    decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
  ) {
    switch navigationAction.navigationType {
    case .linkActivated:
      if let url = navigationAction.request.url {
        NSWorkspace.shared.open(url)
        decisionHandler(.cancel)
      } else {
        decisionHandler(.allow)
      }
    default:
      decisionHandler(.allow)
    }
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    if let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") {
      let jsCode = "document.querySelector('#version').textContent = `v\(version)`"
      webView.evaluateJavaScript(jsCode, completionHandler: nil)
    }
  }

}
