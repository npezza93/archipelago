import Color from 'color'

export const argbBackground = (profileManager, property) => {
  const color = new Color(profileManager.get(property))
  const hex = color.hex().substring(1)
  let opacity = Math.round(color.alpha() * 255).toString(16)
  opacity = (opacity.length < 2) ? '0' + opacity : opacity

  return `#${opacity}${hex}`
}
