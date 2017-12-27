appVersion = require('electron').remote.app.getVersion()

document.addEventListener 'DOMContentLoaded', () ->
  document.querySelector('#version').innerText = "v#{appVersion}"
