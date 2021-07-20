import about from './menus/about';
import file from './menus/file';
import edit from './menus/edit';
import view from './menus/view';
import profiles from './menus/profiles';
import help from './menus/help';

export default (createWindow, profileManager) => [
  about,
  file(createWindow),
  edit,
  view,
  profiles(profileManager),
  {role: 'windowMenu'},
  help(profileManager),
];
