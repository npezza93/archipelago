import {Application} from "@hotwired/stimulus"
import "@hotwired/strada"

import TerminalController from "./controllers/terminal_controller"

const application    = Application.start()
application.debug    = false
window.Stimulus      = application

Stimulus.register("terminal", TerminalController)
