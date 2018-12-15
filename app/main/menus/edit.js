import {accelerators} from '../utils'

export default {
  label: 'Edit',
  submenu: [
    {role: 'undo', accelerator: accelerators.undo},
    {role: 'redo', accelerator: accelerators.redo},
    {type: 'separator'},
    {role: 'cut', accelerator: accelerators.cut},
    {role: 'copy', accelerator: accelerators.copy},
    {role: 'paste', accelerator: accelerators.paste},
    {role: 'selectall', accelerator: accelerators.selectAll}
  ]
}
