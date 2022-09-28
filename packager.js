const packager = require('electron-packager')
const {execSync} = require('child_process')
const {rebuild} = require('electron-rebuild')

packager({
  dir: process.cwd(),
  name: "Archipelago",
  platform: "darwin",
  arch: ["arm64", "x64"],
  icon: "build/icon.icns",
  overwrite: true,
  out: "dist",
  afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((error) => callback(error));
  }],
  osxSign: {
    identity: 'Developer ID Application: Nick Pezza (4K4322K3MA)',
    'hardened-runtime': true,
    entitlements: `${process.cwd()}/build/entitlements.mac.inherit.plist`,
    'entitlements-inherit': `${process.cwd()}/build/entitlements.mac.inherit.plist`,
    'signature-flags': 'library'
  },
  osxNotarize: {
    appleId: process.env["APPLE_ID"],
    appleIdPassword: process.env["APPLE_PASSWORD"]
  }
}).then((files) => {
    files.forEach((pathName) => {
      const file = pathName.split("/")[1]
      console.log(`zipping ${pathName}`)
      execSync(`cd ${pathName} && rm -f ${file}.zip && zip -r --symlinks ${file}.zip Archipelago.app && mv ${file}.zip ../ && cd -`)
    })
  })
