# libghostty-vt 1.0.0

`ghostty-vt-1.0.0.wasm` is the unmodified official ReleaseFast WebAssembly
artifact, downloaded from:

https://release.files.ghostty.org/libghostty-vt/1.0.0/ghostty-vt-1.0.0.wasm

Source tag: [`vt-1.0.0`](https://github.com/ghostty-org/ghostty/tree/vt-1.0.0),
commit `0fa3d577a5614150ff8e2c152de5fb9d5c6d2dec`.

SHA-256 (also asserted by `bun test`):

```
7b428fee6d0677bc81279458f8f9a3335454834123a9ff47efb3fd177f6da5a8
```

The adjacent `.minisig` is the upstream signature. Verify with:

```sh
minisign -V -P RWQlAjJC23149WL2sEpT/l0QKy7hMIFhYdQOFy0Z7z7PbneUgvlsnYcV \
  -m ghostty-vt-1.0.0.wasm
```

The upstream manifest and signature are published alongside the artifact as
`SHA256SUMS` and `SHA256SUMS.minisig`. Licensing information is in
`LICENSE.libghostty`, `third-party.json`, and `licenses/`.

`bun run build` verifies the checksum and embeds these bytes in the checked-in
`application.min.js`. Xcode already bundles that script; no network access,
sidecar WASM resource, Zig installation, or Xcode project change is required.
This is the stable libghostty C API, not the `ghostty-web` npm package or its
patched snapshot of Ghostty.

To update, download a tagged official artifact and signature, verify the
signature and release checksum, update the binding's version assertion and
checksum tests, then rebuild and run both the ABI and browser tests.
