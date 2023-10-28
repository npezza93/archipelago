import {Application} from "@hotwired/stimulus"
import Bridge from "./bridge"

const webBridge = new Bridge()
window.Strada = { web: webBridge }
webBridge.start()

import TerminalController from "./controllers/terminal_controller"

const application    = Application.start()
application.debug    = false
window.Stimulus      = application

Stimulus.register("terminal", TerminalController)
