export default {
  label: 'Edit',
  submenu: [
    {role: 'undo', accelerator: "Cmd+Z"},
    {role: 'redo', accelerator: "Cmd+Y"},
    {type: 'separator'},
    {role: 'cut', accelerator: "Cmd+X"},
    {role: 'copy', accelerator: "Cmd+C"},
    {role: 'paste', accelerator: "Cmd+V"},
    {role: 'pasteAndMatchStyle', accelerator: "Alt+Shift+Cmd+V"},
    {role: 'selectall', accelerator: "Cmd+A"},
    {type: 'separator'},
    {label: "Speech", submenu: [{role: 'startspeaking'}, {role: 'stopspeaking'}]}
  ]
}
