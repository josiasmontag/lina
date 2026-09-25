'use strict';
// Keyboard + gamepad (Xbox controller, standard mapping) input.

const Input = (() => {
  const down = new Set();
  const pressedKeys = new Set();
  const padPressed = new Set();
  let padPrev = [];
  let pad = null;
  let device = 'keyboard';
  let any = false;

  const KEYS = {
    interact: ['KeyE', 'Space', 'Enter'],
    bell: ['KeyQ', 'KeyB'],
    music: ['KeyM'],
    help: ['KeyH'],
  };
  // Xbox: 0=A 1=B 2=X 3=Y 8=View 9=Menu
  const PAD = { interact: [0], bell: [1, 2, 3], music: [8], help: [] };

  addEventListener('keydown', e => {
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    if (!e.repeat) { pressedKeys.add(e.code); any = true; }
    down.add(e.code);
    device = 'keyboard';
  });
  addEventListener('keyup', e => down.delete(e.code));
  addEventListener('blur', () => down.clear());

  function update() {
    padPressed.clear();
    pad = null;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) { pad = p; break; }
    if (!pad) return;
    pad.buttons.forEach((b, i) => {
      const pr = b.pressed || b.value > 0.5;
      if (pr && !padPrev[i]) { padPressed.add(i); device = 'pad'; any = true; }
      padPrev[i] = pr;
    });
    if (Math.hypot(pad.axes[0] || 0, pad.axes[1] || 0) > 0.4) device = 'pad';
  }

  function endFrame() { pressedKeys.clear(); any = false; }

  function pressed(action) {
    return (KEYS[action] || []).some(k => pressedKeys.has(k)) || (PAD[action] || []).some(i => padPressed.has(i));
  }

  function move() {
    let x = 0, y = 0;
    if (down.has('ArrowLeft') || down.has('KeyA')) x -= 1;
    if (down.has('ArrowRight') || down.has('KeyD')) x += 1;
    if (down.has('ArrowUp') || down.has('KeyW')) y -= 1;
    if (down.has('ArrowDown') || down.has('KeyS')) y += 1;
    if (pad) {
      const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0, m = Math.hypot(ax, ay);
      if (m > 0.2) { const k = Math.min(1, (m - 0.2) / 0.7) / m; x += ax * k; y += ay * k; }
      const b = pad.buttons;
      if (b[12] && b[12].pressed) y -= 1;
      if (b[13] && b[13].pressed) y += 1;
      if (b[14] && b[14].pressed) x -= 1;
      if (b[15] && b[15].pressed) x += 1;
    }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y };
  }

  return {
    update, endFrame, pressed, move,
    get device() { return device; },
    get any() { return any; },
    markAny() { any = true; },
  };
})();
