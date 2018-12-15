import about from './menus/about'
import shell from './menus/shell'
import edit from './menus/edit'
import view from './menus/view'
import profiles from './menus/profiles'
import windowMenu from './menus/window'
import help from './menus/help'

export default (createWindow, profileManager) => {
  return [
    about,
    shell(createWindow, profileManager),
    edit,
    view,
    profiles(profileManager),
    windowMenu,
    help
  ]
}
