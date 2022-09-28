const packager = require('electron-packager')
const {exec} = require('child_process')

packager({
  dir: process.cwd(),
  name: "Archipelago",
  platform: "darwin",
  arch: ["arm64", "x64"],
  icon: "build/icon.icns",
  overwrite: true,
  out: "dist",
  // osxSign: {
  //   identity: 'Developer ID Application: Nick Pezza (4K4322K3MA)',
  //   'hardened-runtime': true,
  //   entitlements: `${process.cwd()}/build/entitlements.mac.inherit.plist`,
  //   'entitlements-inherit': `${process.cwd()}/build/entitlements.mac.inherit.plist`,
  //   'signature-flags': 'library'
  // },
  osxNotarize: {
    appleId: process.env["APPLE_ID"],
    appleIdPassword: process.env["APPLE_PASSWORD"]
  }
}).then((files) => {
    files.forEach((file) => {
      console.log(`zipping ${file}`)
      exec(`rm ${file}.zip; zip -r --symlinks ${file}.zip ${file}/Archipelago.app`)
    })
  })
