import {Application} from "@hotwired/stimulus"
import "@hotwired/strada"

import TabsController from './controllers/tabs_controller';
import FontsController from './controllers/fonts_controller';
import RadioController from './controllers/radio_controller';
import SelectController from './controllers/select_controller';
import CheckboxController from './controllers/checkbox_controller';
import TextController from './controllers/text_controller';
import ColorController from './controllers/color_controller';
import ModalController from './controllers/modal_controller';
import KeybindingsController from './controllers/keybindings_controller';
import KeybindingController from './controllers/keybinding_controller';
import KeybindingCapturerController from './controllers/keybinding_capturer_controller';
import KeybindingActionsController from './controllers/keybinding_actions_controller';

// import ProfilesController from './controllers/profiles-controller';
// import ProfileController from './controllers/profile-controller';
// import ProfileCapturerController from './controllers/profile-capturer-controller';
// import ProfileActionsController from './controllers/profile-actions-controller';

const application    = Application.start()
application.debug    = false
window.Stimulus      = application

function withOverriddenSend(BaseClass) {
  return class extends BaseClass {
    send(event, data = {}, callback) {
      data.metadata = { url: "archipelago-1" }

      const message = { component: this.component, event, data, callback }
      const messageId = this.bridge.send(message)
      if (callback) {
        this.pendingMessageCallbacks.push(messageId)
      }
    }
  }
}

application.register('tabs', withOverriddenSend(TabsController))
application.register('fonts', withOverriddenSend(FontsController))
application.register('radio', withOverriddenSend(RadioController))
application.register('select', withOverriddenSend(SelectController))
application.register('checkbox', withOverriddenSend(CheckboxController))
application.register('text', withOverriddenSend(TextController))
application.register('color', withOverriddenSend(ColorController))
application.register('modal', ModalController)
application.register('keybindings', withOverriddenSend(KeybindingsController))
application.register('keybinding', KeybindingController)
application.register('keybinding-capturer', withOverriddenSend(KeybindingCapturerController))
application.register('keybinding-actions', withOverriddenSend(KeybindingActionsController))
// app.register('profiles', ProfilesController);
// app.register('profile', ProfileController);
// app.register('profile-capturer', ProfileCapturerController);
// app.register('profile-actions', ProfileActionsController);

window.addEventListener('blur', () => document.body.dataset.focus = 'false');
window.addEventListener('focus', () => document.body.dataset.focus = 'true');
