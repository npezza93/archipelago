const MODIFIERS = {
  command: '\u2318',
  cmd: '\u2318',
  commandorcontrol: '\u2318',
  cmdorctrl: '\u2318',
  super: '\u2318',
  control: '\u2303',
  ctrl: '\u2303',
  shift: '\u21E7',
  alt: '\u2325',
  plus: '=',
};

export default accelerator => (accelerator || '').split('-').map(key => MODIFIERS[key.toLowerCase()] || key).join('+');
