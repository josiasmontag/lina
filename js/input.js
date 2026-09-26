'use strict';
// Keyboard, gamepad (Xbox controller, standard mapping) and touch input.

const Input = (() => {
  const down = new Set();
  const pressedKeys = new Set();
  const padPressed = new Set();
  let padPrev = [];
  let pad = null;
  let device = matchMedia('(pointer: coarse)').matches ? 'touch' : 'keyboard';
  let any = false;

  const KEYS = {
    interact: ['KeyE', 'Space', 'Enter'],
    bell: ['KeyQ', 'KeyB'],
    music: ['KeyM'],
    help: ['KeyH'],
  };
  // Xbox: 0=A 1=B 2=X 3=Y 8=View 9=Menu
  const PAD = { interact: [0], bell: [1, 2, 3], music: [8], help: [], reset: [9] };

  addEventListener('keydown', e => {
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    if (!e.repeat) { pressedKeys.add(e.code); any = true; }
    down.add(e.code);
    device = 'keyboard';
    document.body.classList.remove('touch');
  });
  addEventListener('keyup', e => down.delete(e.code));
  addEventListener('blur', () => down.clear());

  // Touch: a floating stick wherever the left thumb lands, plus Ⓐ / Ⓑ buttons.
  const touch = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const touchPressed = new Set();
  const STICK_R = 46;
  const ui = document.getElementById('touch');
  const base = ui && ui.querySelector('.stick'), knob = ui && ui.querySelector('.knob');

  function capture(el, e) { try { el.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ } }
  function showTouch() {
    if (device === 'touch') return;
    device = 'touch';
    document.body.classList.add('touch');
  }
  if (ui) {
    ui.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      showTouch(); any = true;
      const btn = e.target.closest('[data-action]');
      if (btn) {
        touchPressed.add(btn.dataset.action);
        btn.classList.add('down');
        capture(btn, e);
        return;
      }
      if (touch.id !== null) return;
      touch.id = e.pointerId; touch.ox = touch.x = e.clientX; touch.oy = touch.y = e.clientY;
      capture(ui, e);
      base.style.transform = `translate(${touch.ox}px, ${touch.oy}px)`;
      knob.style.transform = `translate(${touch.ox}px, ${touch.oy}px)`;
      ui.classList.add('active');
    });
    ui.addEventListener('pointermove', e => {
      if (e.pointerId !== touch.id) return;
      let dx = e.clientX - touch.ox, dy = e.clientY - touch.oy;
      const m = Math.hypot(dx, dy);
      // drag past the rim and the stick follows the thumb
      if (m > STICK_R) {
        const k = (m - STICK_R) / m;
        touch.ox += dx * k; touch.oy += dy * k; dx -= dx * k; dy -= dy * k;
        base.style.transform = `translate(${touch.ox}px, ${touch.oy}px)`;
      }
      touch.x = touch.ox + dx; touch.y = touch.oy + dy;
      knob.style.transform = `translate(${touch.x}px, ${touch.y}px)`;
    });
    const end = e => {
      const btn = e.target.closest && e.target.closest('[data-action]');
      if (btn) btn.classList.remove('down');
      if (e.pointerId === touch.id) { touch.id = null; ui.classList.remove('active'); }
    };
    ui.addEventListener('pointerup', end);
    ui.addEventListener('pointercancel', end);
    ui.addEventListener('contextmenu', e => e.preventDefault());
  }

  function update() {
    padPressed.clear();
    pad = null;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) { pad = p; break; }
    if (!pad) return;
    pad.buttons.forEach((b, i) => {
      const pr = b.pressed || b.value > 0.5;
      if (pr && !padPrev[i]) { padPressed.add(i); device = 'pad'; any = true; document.body.classList.remove('touch'); }
      padPrev[i] = pr;
    });
    if (Math.hypot(pad.axes[0] || 0, pad.axes[1] || 0) > 0.4) device = 'pad';
  }

  function endFrame() { pressedKeys.clear(); touchPressed.clear(); any = false; }

  function pressed(action) {
    return (KEYS[action] || []).some(k => pressedKeys.has(k)) || (PAD[action] || []).some(i => padPressed.has(i)) ||
      touchPressed.has(action);
  }

  function held(action) {
    return !!pad && (PAD[action] || []).some(i => padPrev[i]);
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
    if (touch.id !== null) {
      const dx = touch.x - touch.ox, dy = touch.y - touch.oy, m = Math.hypot(dx, dy);
      if (m > 8) { const k = Math.min(1, (m - 8) / (STICK_R - 16)) / m; x += dx * k; y += dy * k; }
    }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y };
  }

  return {
    update, endFrame, pressed, held, move,
    get device() { return device; },
    get any() { return any; },
    markAny() { any = true; },
  };
})();
