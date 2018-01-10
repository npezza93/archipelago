{ remote } = require 'electron'

document.addEventListener 'DOMContentLoaded', () ->
  document.querySelector('#version').innerText = "v#{remote.app.getVersion()}"
