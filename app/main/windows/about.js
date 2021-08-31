import {nativeTheme} from 'electron';
import {makeWindow} from '../utils';

let aboutWindow = null;
const windowOptions = {
  width: 300,
  height: 500,
  backgroundColor: nativeTheme.shouldUseDarkColors ? '#393736' : '#F5F5F5',
};

export default {
  toggle() {
    if (aboutWindow === null || aboutWindow.isDestroyed()) {
      aboutWindow = makeWindow('about', windowOptions);
      aboutWindow.setResizable(false);
      aboutWindow.setMaximizable(false);
      aboutWindow.setMinimizable(false);
      aboutWindow.setFullScreenable(false);
      aboutWindow.title = 'About';
    } else {
      aboutWindow.focus();
    }
  },
};
