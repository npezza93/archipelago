const packager = require('electron-packager')
const {execSync} = require('child_process')
const {rebuild} = require('electron-rebuild')
const { sign } = require('@electron/osx-sign')
const { notarize } = require('electron-notarize');

packager({
  dir: process.cwd(),
  name: "Archipelago",
  platform: "darwin",
  arch: "arm64",
  icon: `${process.cwd()}/build/icon.icns`,
  overwrite: true,
  asar: false,
  afterCopy: [async (buildPath, electronVersion, platform, arch, callback) => {
    await rebuild({ buildPath, electronVersion, arch })
    callback()
  }]
}).then((files) => {
    files.forEach((pathName) => {
      console.log(`\nSigning ${pathName}`)

      sign({
        app: `${pathName}/Archipelago.app`,
        hardenedRuntime: true,
        identity: 'Developer ID Application: Nick Pezza (4K4322K3MA)',
        entitlements: `${process.cwd()}/entitlements.plist`
      })

      console.log(`Signed ${pathName}`)

      console.log(`Notarizing ${pathName}`)
      notarize({
        appPath: `${pathName}/Archipelago.app`,
        appleId: process.env["APPLE_ID"],
        appleIdPassword: process.env["APPLE_PASSWORD"]
        appBundleId: "dev.archipelago",
      }).then(() => {
          console.log(`Notarized ${pathName}`)

          const file = pathName.split("/").pop()
          console.log(`Zipping ${pathName}`)
          const cmd = `cd ${pathName} && rm -f ${file}.zip && zip -r --symlinks ${file}.zip Archipelago.app && mv ${file}.zip ../ && cd -`
          execSync(cmd, {stdio: 'inherit'})
        })
    })
  })
