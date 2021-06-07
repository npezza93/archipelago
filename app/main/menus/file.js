export default (createWindow) => {
  return {
    label: 'Shell',
    submenu: [
      {
        label: 'New Window',
        accelerator: "Cmd+N",
        click: createWindow
      },
      {type: 'separator'},
      {
        label: 'Close',
        accelerator: "Cmd+W",
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('close-via-menu')
          }
        }
      }
    ]
  }
}
