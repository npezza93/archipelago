os                           = require('os')
{ app, autoUpdater, dialog } = require('electron')

module.exports =
  class AutoUpdate
    version: ->
      app.getVersion()

    platform: ->
      "#{os.platform()}_#{os.arch()}"

    url: ->
      'https://archipelago-terminal.herokuapp.com/update/'

    autoCheck: ->
      autoUpdater.on 'update-available', () =>
        console.log('update-available')
      autoUpdater.on 'update-not-available', () =>
        console.log('update-not-available')
      autoUpdater.on 'checking-for-update', () =>
        console.log('checking-for-update')
      autoUpdater.on 'error', (err) =>
        console.log(err)

      @bindDownloaded()
      autoUpdater.setFeedURL("#{@url()}#{@platform()}/#{@version()}")

      autoUpdater.checkForUpdates()

    # manualCheck: ->
    #   autoUpdater.on 'update-available', () =>
    #     console.log('update-available')
    # 	autoUpdater.on 'update-not-available', () =>
    #     console.log('update-not-available')
    # 	autoUpdater.on 'checking-for-update', () =>
    #     console.log('checking-for-update')
    #   autoUpdater.on 'error', (err) =>
    #     console.log(err)
    #   @bindDownloaded()
    #   autoUpdater.checkForUpdates()

    bindDownloaded: ->
      autoUpdater.on 'update-downloaded', (event, releaseNotes, releaseName) =>
        message = "#{app.getName()} #{releaseName} is now available!\nRestart #{app.getName()} to install."

        if releaseNotes
          message += '\n\nRelease notes:\n'
          releaseNotes.split(/[^\r]\n/).forEach (notes) =>
            message += notes + '\n\n'

        dialog.showMessageBox {
          type: 'question'
          buttons: ['Install and Relaunch', 'Later'],
          defaultId: 0
          message: 'A new version of ' + app.getName() + ' has been downloaded'
          detail: message
        }, (response) ->

        dialog.showMessageBox {
          type: 'question',
          buttons: ['Install and Relaunch', 'Later'],
          defaultId: 0,
          message: "A new version of #{app.getName()} has been downloaded",
          detail: message
        }, (response) =>
          if response == 0
            autoUpdater.quitAndInstall()
