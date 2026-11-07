import wasmBytes from './vendor/ghostty-vt-1.0.0.wasm'

// WKWebView uses file:// resources. Compile embedded bytes instead of fetching
// a sidecar file, so terminals also work offline in a notarized app bundle.
let compiled
export function loadGhostty() {
  return (compiled ??= WebAssembly.compile(wasmBytes))
}
