const packager = require('electron-packager')
const {execSync} = require('child_process')
const {rebuild} = require('electron-rebuild')

packager({
  dir: process.cwd(),
  name: "Archipelago",
  platform: "darwin",
  arch: "x64",
  icon: `${process.cwd()}/build/icon.icns`,
  overwrite: true,
  asar: false,
  afterCopy: [async (buildPath, electronVersion, platform, arch, callback) => {
    await rebuild({ buildPath, electronVersion, arch })
    callback()
  }],
  osxSign: {
    identity: 'Developer ID Application: Nick Pezza (4K4322K3MA)',
    'hardened-runtime': true,
    entitlements: `${process.cwd()}/entitlements.plist`,
    'entitlements-inherit': `${process.cwd()}/entitlements.plist`,
    'signature-flags': 'library'
  },
  osxNotarize: {
    appleId: process.env["APPLE_ID"],
    appleIdPassword: process.env["APPLE_PASSWORD"]
  }
}).then((files) => {
    files.forEach((pathName) => {
      const file = pathName.split("/").pop()
      console.log(`zipping ${pathName}`)
      const cmd = `cd ${pathName} && rm -f ${file}.zip && zip -r --symlinks ${file}.zip Archipelago.app && mv ${file}.zip ../ && cd -`
      execSync(cmd, {stdio: 'inherit'})
    })
  })
