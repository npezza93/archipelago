export default schema => {
  let {type, color, keybinding} = schema

  if (type === 'string' && color) {
    type = 'color'
  }

  if (type === 'string' && keybinding) {
    type = 'keybinding'
  }

  return type
}
