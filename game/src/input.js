// input.js — keyboard and mouse state for the heist.
// One file, one job: what the player is pressing. No game logic here.

export function createInput(canvas) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };

  const KEYMAP = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    ShiftLeft: 'sneak',
    ShiftRight: 'sneak',
    KeyE: 'use',
    Space: 'use',
    Digit1: 'smoke',
    KeyQ: 'smoke',
    Digit2: 'emp',
    Digit3: 'coin',
    KeyR: 'restart',
    KeyM: 'mute',
    Enter: 'start',
  };

  function onKeyDown(e) {
    const action = KEYMAP[e.code];
    if (!action) return;
    keys.add(action);
    if (action === 'use' || action === 'start' || action === 'restart') e.preventDefault();
  }
  function onKeyUp(e) {
    const action = KEYMAP[e.code];
    if (action) keys.delete(action);
  }
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
  function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.clickX = e.clientX - rect.left;
    mouse.clickY = e.clientY - rect.top;
    mouse.clicked = true;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    keys,
    mouse,
    down(action) {
      return keys.has(action);
    },
    // Movement vector from the held keys, normalised.
    moveVector() {
      let x = 0;
      let y = 0;
      if (keys.has('left')) x -= 1;
      if (keys.has('right')) x += 1;
      if (keys.has('up')) y -= 1;
      if (keys.has('down')) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.hypot(x, y);
        x *= inv;
        y *= inv;
      }
      return { x, y };
    },
    // A click is consumed once, so one press throws exactly one coin.
    takeClick() {
      if (!mouse.clicked) return null;
      mouse.clicked = false;
      return { x: mouse.clickX, y: mouse.clickY };
    },
  };
}
