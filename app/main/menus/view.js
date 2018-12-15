import {accelerators} from '../utils'

export default {
  label: 'View',
  submenu: [
    {role: 'reload', accelerator: accelerators.reload},
    {role: 'forcereload', accelerator: accelerators.forceReload},
    {role: 'toggledevtools', accelerator: accelerators.toggleDevtools},
    {type: 'separator'},
    {role: 'resetzoom', accelerator: accelerators.resetZoom},
    {role: 'zoomin', accelerator: accelerators.zoomIn},
    {role: 'zoomout', accelerator: accelerators.zoomOut},
    {type: 'separator'},
    {role: 'togglefullscreen', accelerator: accelerators.toggleFullscreen}
  ]
}
