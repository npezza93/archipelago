module.exports = {
  "packagerConfig": {
    "icon": "build/icon.icns",
    "osxSign": {
      "identity": "Developer ID Application: Nick Pezza (4K4322K3MA)",
      "hardened-runtime": true,
      "entitlements": "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "signature-flags": "library"
    },
    "osxNotarize": {
      "appleId": process.env["APPLE_ID"],
      "appleIdPassword": process.env["APPLE_PASSWORD"]
    }
  },
  "plugins": [],
  "makers": [
    {
      "name": "@electron-forge/maker-zip",
      "platforms": [
        "darwin"
      ]
    }
  ]
}
