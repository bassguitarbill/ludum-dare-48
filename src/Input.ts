enum Controls {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  THRUST,
  CLAW_EXTEND,
  CLAW_RELEASE,
}

const keyboardMap: { [key: string]: Controls} = {
  ArrowDown: Controls.DOWN,
  ArrowUp: Controls.UP,
  ArrowLeft: Controls.LEFT,
  ArrowRight: Controls.RIGHT,

  s: Controls.DOWN,
  w: Controls.UP,
  a: Controls.LEFT,
  d: Controls.RIGHT,

  ' ': Controls.THRUST,
}

const controlMap = {
  [Controls.DOWN]: ['s', 'ArrowDown'],
  [Controls.UP]: ['w', 'ArrowUp'],
  [Controls.LEFT]: ['a', 'ArrowLeft'],
  [Controls.RIGHT]: ['d', 'ArrowRight'],
  [Controls.THRUST]: [' '],
  [Controls.CLAW_EXTEND]: [],
  [Controls.CLAW_RELEASE]: [],
}

const currentlyPressedKeys: {[key: string]: boolean} = {};

window.addEventListener('keydown', ev => {
  if (ev.key in keyboardMap) {
    currentlyPressedKeys[ev.key] = true;
  }
});
window.addEventListener('keyup', ev => {
  if (ev.key in keyboardMap) {
    currentlyPressedKeys[ev.key] = false;
  }
});

function isControlPressed(control: Controls): boolean {
  return !!controlMap[control].find(keyName => currentlyPressedKeys[keyName]);
}

export { Controls, isControlPressed };