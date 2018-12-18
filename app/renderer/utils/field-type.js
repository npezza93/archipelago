export default schema => {
  let {type, color, keybinding} = schema

  if (type === 'string' && color) {
    type = 'color'
  }

  return type
}
