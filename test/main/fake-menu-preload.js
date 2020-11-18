function findItem(menuItem, labels) {
  const target = labels[0];
  const rest = labels.slice(1);
  const foundItem = menuItem.find(item => item.label === target);
  if (rest.length === 0) {
    return foundItem;
  }
  return findItem(foundItem.submenu.items, rest);
}


require('electron').ipcMain.on('SPECTRON_SET_PROPERTY/SEND', (_e, {property, value}) => {
  for (const window of require('electron').BrowserWindow.getAllWindows()) {
    require('electron-better-ipc').ipcMain.callRenderer(window, 'setting-changed', {property, value})
  }
});

require('electron').ipcMain.on('SPECTRON_FAKE_MENU/SEND', (_e, labels) => {
  const item = findItem(require('electron').Menu.getApplicationMenu().items, labels);
  item.click(item, require('electron').BrowserWindow.getFocusedWindow());
});
