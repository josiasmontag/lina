'use strict';
// ---------------------------------------------------------------------------
// LINA — main loop, player, bike, camera, rendering.
// ---------------------------------------------------------------------------

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
let VW = 400, VH = 225, SCALE = 3, vignette = null;

const G = {
  t: 0, started: false, scene: null, scenes: {}, cam: { x: 0, y: 0 },
  particles: [], trans: null, target: null, night: 0, shake: 0, camOff: { x: 0, y: -14 },
};
const Pl = { x: 0, y: 0, dir: 'down', vx: 0, vy: 0, riding: false, dist: 0, frame: 0, moving: false,
  swing: null, sleep: null, blink: 0, blinkT: 2.5, jump: 0 };
const bike = { scene: 'out', x: 0, y: 0, face: 'right' };
const cat = { x: 600, y: 520, tx: 600, ty: 520, state: 'sit', t: 2, face: 'right', dist: 0, follow: 0 };
const butterflies = [];
const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

// ---------------------------------------------------------------- setup ----
function resize() {
  // The canvas runs at full device resolution; one game pixel = WS device pixels.
  // It fills the screen via CSS and we measure it, rather than trusting
  // innerHeight, which iOS reports too small at launch and after rotating.
  const dpr = window.devicePixelRatio || 1;
  cv.style.width = cv.style.height = '';
  let w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight;
  if (navigator.standalone) { // home screen app: always the whole screen
    const land = w > h;
    w = Math.max(w, land ? screen.height : screen.width);
    h = Math.max(h, land ? screen.width : screen.height);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
  }
  // Fit about 235 game pixels vertically, but keep phones in portrait wide enough.
  SCALE = Math.max(2, Math.round(Math.min(h / 235, w / 300)));
  WS = Math.max(2, Math.round(SCALE * dpr));
  const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
  if (cv.width === cw && cv.height === ch && vignette) return;
  cv.width = cw; cv.height = ch;
  VW = cv.width / WS; VH = cv.height / WS;
  ctx.imageSmoothingEnabled = false;
  const [c, g] = makeCanvas(Math.ceil(VW), Math.ceil(VH));
  const grd = g.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
  grd.addColorStop(0, 'rgba(20,10,25,0)'); grd.addColorStop(1, 'rgba(20,10,25,0.55)');
  g.fillStyle = grd; g.fillRect(0, 0, VW, VH);
  vignette = c;
}

let cloudTex = null;
function makeClouds() {
  const [c, g] = makeCanvas(512, 512);
  const r = rng(77);
  for (let i = 0; i < 7; i++) {
    const x = r() * 512, y = r() * 512, rad = 60 + r() * 70;
    for (const [ox, oy] of [[0, 0], [512, 0], [0, 512], [512, 512], [-512, 0], [0, -512], [-512, -512], [512, -512], [-512, 512]]) {
      const grd = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      grd.addColorStop(0, 'rgba(30,20,50,0.16)'); grd.addColorStop(1, 'rgba(30,20,50,0)');
      g.fillStyle = grd; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
    }
  }
  cloudTex = c;
}

function init() {
  resize();
  addEventListener('resize', resize);
  addEventListener('orientationchange', () => setTimeout(resize, 300));
  if (window.ResizeObserver) new ResizeObserver(resize).observe(cv);
  makeClouds();
  G.scenes.out = buildOutdoor();
  Object.assign(G.scenes, buildInteriors());
  G.scene = G.scenes.out;
  const home = OUT.houses[0];
  Pl.x = home.doorWorldX; Pl.y = OUT.sw1 + 14; Pl.dir = 'down';
  bike.x = home.doorWorldX + 34; bike.y = OUT.sw1 + 18; bike.face = 'right';
  const r = rng(9);
  for (let i = 0; i < 7; i++) {
    const [fx, fy] = pick(r, G.scenes.out.flowerSpots);
    butterflies.push({ x: fx, y: fy - 10, hx: fx, hy: fy, t: r() * 10, col: pick(r, ['#ffffff', '#ffd35a', '#7ab8ff', '#f28bb0', '#ff9a4a']), tx: fx, ty: fy });
  }
  snapCamera();
  addEventListener('pointerdown', () => { Input.markAny(); });
  // iOS only lets audio start inside a real touch/click handler, and suspends
  // it again when the app goes to the background.
  for (const ev of ['pointerup', 'touchend', 'keydown']) addEventListener(ev, () => { if (G.started) Sound.init(); });
  requestAnimationFrame(loop);
}

function startGame() {
  G.started = true;
  Sound.init();
  document.getElementById('title').classList.add('hidden');
  const help = document.getElementById('help');
  help.style.opacity = 1;
  setTimeout(() => { help.style.opacity = 0; }, 12000);
}

// ------------------------------------------------------------ collision ----
function blocked(sc, x, y, hw = 5) {
  const b = sc.bounds;
  if (x - hw < b.x0 || x + hw > b.x1 || y - 4 < b.y0 || y > b.y1) return true;
  const hb = { x: x - hw, y: y - 4, w: hw * 2, h: 4 };
  for (const s of sc.solids) if (overlap(hb, s)) return true;
  return false;
}

// Moves in small steps, one axis at a time. With `slide`, bumping into the
// corner of something nudges the actor sideways around it instead of sticking.
function moveActor(a, dx, dy, hw, slide = false) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
  const sx = dx / steps, sy = dy / steps;
  let hitX = false, hitY = false;
  const nudge = (axis, d) => {
    for (let n = 1; n <= 4; n++) for (const sg of [-1, 1]) {
      const ox = axis === 'x' ? 0 : sg * n, oy = axis === 'x' ? sg * n : 0;
      const tx = a.x + ox + (axis === 'x' ? d : 0), ty = a.y + oy + (axis === 'y' ? d : 0);
      if (!blocked(G.scene, tx, ty, hw) && !blocked(G.scene, a.x + Math.sign(ox) * 0.5, a.y + Math.sign(oy) * 0.5, hw)) {
        a.x += Math.sign(ox) * 0.5; a.y += Math.sign(oy) * 0.5; return true;
      }
    }
    return false;
  };
  for (let i = 0; i < steps; i++) {
    if (!hitX && sx) {
      if (!blocked(G.scene, a.x + sx, a.y, hw)) a.x += sx;
      else if (!(slide && !sy && nudge('x', sx))) hitX = true;
    }
    if (!hitY && sy) {
      if (!blocked(G.scene, a.x, a.y + sy, hw)) a.y += sy;
      else if (!(slide && !sx && nudge('y', sy))) hitY = true;
    }
  }
  return { hitX, hitY };
}

function surfaceAt(x, y) {
  if (!G.scene.outdoor) return 'wood';
  return inGravel(x, y) ? 'gravel' : 'soft';
}

// -------------------------------------------------------------- effects ----
function burst(x, y, kind, n) {
  for (let i = 0; i < n; i++) {
    const p = { x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 25,
      g: 0, life: 1.2 + Math.random() * 0.6, kind, col: null };
    p.max = p.life;
    if (kind === 'heart' || kind === 'star' || kind === 'note' || kind === 'z') { p.vy = -18 - Math.random() * 12; p.vx *= 0.6; }
    if (kind === 'note') p.spr = pick(Math.random, SPR.icon.notes);
    if (kind === 'confetti') { p.col = pick(Math.random, ['#e5484d', '#ffd35a', '#4fb35a', '#4a8ad0', '#f28bb0', '#c86ad8']); p.vy = -50 - Math.random() * 40; p.vx *= 2.5; p.g = 90; }
    if (kind === 'crumb') { p.col = pick(Math.random, ['#c6863f', '#e2a95c', '#f0d09a']); p.g = 120; p.vy = -40; p.life = p.max = 0.9; }
    if (kind === 'spark') { p.col = pick(Math.random, ['#ffd24a', '#ff9a3c', '#fff0a0']); p.vy = -30 - Math.random() * 30; p.life = p.max = 0.8; }
    if (kind === 'leaf') { p.col = pick(Math.random, ['#55873d', '#76a54a', '#3c6934']); p.g = 40; p.vy = -35; p.vx *= 1.8; }
    if (kind === 'dust') { p.col = 'rgba(220,205,180,0.8)'; p.vy = -6 - Math.random() * 6; p.vx *= 0.4; p.life = p.max = 0.5; }
    if (kind === 'z') { p.vx = 6 + Math.random() * 6; p.life = p.max = 2.2; }
    G.particles.push(p);
  }
}

function updateParticles(dt) {
  for (const p of G.particles) {
    p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind === 'heart' || p.kind === 'note' || p.kind === 'z' || p.kind === 'fallleaf') p.x += Math.sin(p.life * 5) * 0.3;
    if (p.kind === 'fallleaf' && p.y > p.floor) { p.vy = 0; p.vx = 0; p.g = 0; }
  }
  G.particles = G.particles.filter(p => p.life > 0);
}

function drawParticles() {
  for (const p of G.particles) {
    const a = Math.min(1, p.life / Math.min(0.5, p.max * 0.5));
    ctx.globalAlpha = a;
    if (p.kind === 'heart') drawSprite(ctx, SPR.icon.heart, p.x, p.y);
    else if (p.kind === 'star') drawSprite(ctx, SPR.icon.star, p.x, p.y);
    else if (p.kind === 'note') drawSprite(ctx, p.spr, p.x, p.y);
    else if (p.kind === 'z') drawSprite(ctx, SPR.icon.z, p.x, p.y);
    else { ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.kind === 'confetti' || p.kind === 'fallleaf' ? 2 : 1, 1); }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- bike -----
function mount() {
  Pl.riding = true; Pl.x = bike.x; Pl.y = bike.y; Pl.dir = bike.face; Pl.vx = Pl.vy = 0;
  bike.scene = null; Sound.pop();
}
function dismount() {
  Pl.riding = false;
  bike.scene = G.scene.id; bike.x = Pl.x; bike.y = Pl.y;
  bike.face = Pl.dir === 'left' ? 'left' : 'right';
  for (const [dx, dy] of [[0, 10], [0, -10], [14, 0], [-14, 0], [0, 16]]) {
    if (!blocked(G.scene, Pl.x + dx, Pl.y + dy)) { Pl.x += dx; Pl.y += dy; break; }
  }
  Pl.vx = Pl.vy = 0; Pl.dir = 'down';
  Sound.pop();
}

// ---------------------------------------------------------------- swing ----
function startSwing(o) {
  Pl.swing = { obj: o, timer: 0 }; o.rider = true; o.amp = Math.max(o.amp, 0.2);
  Sound.boing();
}
function leaveSwing() {
  const o = Pl.swing.obj; o.rider = false; Pl.swing = null;
  Pl.x = o.seatX; Pl.y = o.y + 10; Pl.dir = 'down';
}

// ---------------------------------------------------------------- sleep ----
function startSleep(bed) {
  Pl.sleep = { bed, t: 0, z: 0.6, song: 0 };
  Pl.vx = Pl.vy = 0;
  Sound.hold(true);
  Sound.sparkle();
}
function wake() {
  const b = Pl.sleep.bed;
  Pl.sleep = null;
  Pl.x = b.x + 22; Pl.y = b.y - 8; Pl.dir = 'down';
  if (blocked(G.scene, Pl.x, Pl.y)) { Pl.x = b.x; Pl.y = b.y + 10; }
  Sound.hold(false);
  Sound.chirp();
  burst(Pl.x, Pl.y - 26, 'star', 5);
}
function updateSleep(dt, mag) {
  const s = Pl.sleep;
  s.t += dt; s.z -= dt; s.song -= dt;
  if (s.song <= 0 && s.t > 0.8) s.song = Sound.lullaby() + 2.5;
  if (s.z <= 0) { s.z = 1.1; burst(s.bed.x + 4, s.bed.y - 34, 'z', 1); }
  if (s.t > 1.5 && (mag > 0.5 || Input.pressed('interact') || Input.pressed('bell'))) wake();
}
// Lina tucked in: head on the pillow, blanket pulled up, hands on top.
function drawSleeper(b) {
  const bx = Math.round(b.x) - 14, by = Math.round(b.y) - 41;
  const breathe = Math.sin(G.t * 1.6) > 0 ? 0 : 1;
  drawSprite(ctx, SPR.sleepHead, b.x, by + 18);
  const R2 = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(bx + x, by + y, w, h); };
  R2(2, 19, 24, 17, '#ec94b2');
  R2(7, 22 - breathe, 14, 11 + breathe, '#f19cb9'); R2(7, 22 - breathe, 14, 1, '#f7bfd2');
  R2(6, 23 - breathe, 1, 10, '#d97a9e'); R2(21, 23 - breathe, 1, 10, '#d97a9e');
  R2(2, 18, 24, 3, '#f7bfd2'); R2(2, 20, 24, 1, '#e38aab'); R2(2, 34, 24, 2, '#c96d8f');
  for (const [x, y] of [[4, 25], [23, 27], [13, 29]]) { R2(x, y, 1, 1, '#fff'); R2(x + 2, y, 1, 1, '#fff'); R2(x, y + 1, 3, 1, '#fff'); R2(x + 1, y + 2, 1, 1, '#fff'); }
  R2(8, 18, 2, 2, LC.skin); R2(18, 18, 2, 2, LC.skin);
}

// -------------------------------------------------------------- targets ----
function findTarget() {
  if (Pl.riding || Pl.swing || Pl.sleep || G.trans) return null;
  const [dx, dy] = DIRV[Pl.dir];
  const fx = Pl.x + dx * 10, fy = Pl.y - 3 + dy * 8;
  let best = null, bd = 24;
  const consider = (o, ix, iy) => { const d = Math.hypot(ix - fx, iy - fy); if (d < bd) { bd = d; best = o; } };
  for (const o of G.scene.objects) if (o.interact) consider(o, o.ix ?? o.x, o.iy ?? o.y);
  if (bike.scene === G.scene.id) consider(BIKE_TARGET, bike.x, bike.y - 2);
  if (G.scene.outdoor) consider(CAT_TARGET, cat.x, cat.y);
  return best;
}
const BIKE_TARGET = { interact: mount, get x() { return bike.x; }, get top() { return bike.y - 22; } };
const CAT_TARGET = {
  interact() { Sound.meow(); burst(cat.x, cat.y - 12, 'heart', 3); cat.state = 'sit'; cat.t = 1.2; cat.follow = 14; cat.face = Pl.x < cat.x ? 'left' : 'right'; },
  get x() { return cat.x; }, get top() { return cat.y - 14; },
};
function targetTop(o) {
  if (o.top !== undefined) return o.top;
  return o.y - (o.spr ? o.spr.ay : 20);
}

// ------------------------------------------------------------ scenes -------
function goTo(sceneId, x, y, dir) {
  if (G.trans) return;
  Sound.door();
  G.trans = { t: 0, dur: 0.35, stage: 'out', cb: () => {
    G.scene = G.scenes[sceneId]; Pl.x = x; Pl.y = y; Pl.dir = dir; Pl.vx = Pl.vy = 0;
    G.particles = [];
    Sound.setMood(G.scene.outdoor ? 'out' : 'in');
    snapCamera();
  } };
}

function checkDoors(mv) {
  const hb = { x: Pl.x - 5, y: Pl.y - 4, w: 10, h: 4 };
  for (const d of G.scene.doors) {
    if (!overlap(hb, d)) continue;
    if ((d.need === 'up' && mv.y < -0.3) || (d.need === 'down' && mv.y > 0.3)) {
      if (d.to === 'out') goTo('out', d.spawn.x, d.spawn.y, 'down');
      else {
        if (Pl.riding) dismount();
        const room = G.scenes[d.to];
        goTo(d.to, room.entry.x, room.entry.y, 'up');
      }
      return;
    }
  }
}

// -------------------------------------------------------------- player -----
function updatePlayer(dt) {
  const mv = Input.move();
  const mag = Math.hypot(mv.x, mv.y);

  if (Pl.sleep) { updateSleep(dt, mag); return; }
  if (Pl.swing) {
    Pl.swing.timer += dt;
    const o = Pl.swing.obj;
    o.amp = Math.min(0.9, o.amp + dt * 0.25);
    if (Input.pressed('interact') || Input.pressed('bell') || (Pl.swing.timer > 0.8 && mag > 0.5)) leaveSwing();
    return;
  }

  if (Input.pressed('bell')) {
    if (Pl.riding) { Sound.bell(); burst(Pl.x, Pl.y - 40, 'note', 2); }
    else if (Pl.jump <= 0) { Pl.jump = 0.42; Sound.boing(); }
  }
  if (Input.pressed('interact')) {
    if (Pl.riding) dismount();
    else if (G.target) G.target.interact(G.target);
  }

  let speed;
  if (Pl.riding) {
    const max = 135, tx = mv.x * max, ty = mv.y * max;
    const k = mag > 0.1 ? 2.8 : 1.8;
    Pl.vx += (tx - Pl.vx) * Math.min(1, k * dt);
    Pl.vy += (ty - Pl.vy) * Math.min(1, k * dt);
    if (Math.hypot(Pl.vx, Pl.vy) < 2 && mag < 0.1) Pl.vx = Pl.vy = 0;
  } else {
    Pl.vx = mv.x * 60; Pl.vy = mv.y * 60;
  }
  speed = Math.hypot(Pl.vx, Pl.vy);

  // facing
  const fx = Pl.riding ? Pl.vx : mv.x, fy = Pl.riding ? Pl.vy : mv.y;
  if (Math.hypot(fx, fy) > (Pl.riding ? 8 : 0.2)) {
    if (Math.abs(fx) > Math.abs(fy) * 1.15) Pl.dir = fx > 0 ? 'right' : 'left';
    else if (Math.abs(fy) > Math.abs(fx) * 1.15) Pl.dir = fy > 0 ? 'down' : 'up';
  }

  const ox = Pl.x, oy = Pl.y;
  const hit = moveActor(Pl, Pl.vx * dt, Pl.vy * dt, Pl.riding && (Pl.dir === 'left' || Pl.dir === 'right') ? 9 : 5, !Pl.riding);
  if (Pl.riding) { if (hit.hitX) Pl.vx *= -0.2; if (hit.hitY) Pl.vy *= -0.2; }
  const moved = Math.hypot(Pl.x - ox, Pl.y - oy);
  Pl.dist += moved;
  Pl.moving = moved > 0.05;

  const prev = Pl.frame;
  if (Pl.riding) Pl.frame = Math.floor(Pl.dist / 6) % 4;
  else Pl.frame = Pl.moving ? Math.floor(Pl.dist / 7) % 4 : 0;
  if (!Pl.riding && Pl.moving && prev !== Pl.frame && (Pl.frame === 1 || Pl.frame === 3)) Sound.step(surfaceAt(Pl.x, Pl.y));
  if (Pl.riding && speed > 90 && Math.random() < dt * 10 && G.scene.outdoor) {
    burst(Pl.x - Math.sign(Pl.vx) * 10, Pl.y - 1, 'dust', 1);
  }

  if (Pl.jump > 0) Pl.jump -= dt;
  Pl.blinkT -= dt;
  if (Pl.blinkT < 0) { Pl.blink = 0.13; Pl.blinkT = 2.2 + Math.random() * 2.5; }
  if (Pl.blink > 0) Pl.blink -= dt;

  checkDoors(mv);
}

// ----------------------------------------------------------- world life ----
function updateCat(dt) {
  const sc = G.scenes.out;
  cat.t -= dt;
  if (cat.follow > 0) cat.follow -= dt;
  const following = cat.follow > 0 && G.scene === sc;
  if (following) {
    const side = Pl.dir === 'left' ? 16 : -16;
    cat.tx = Pl.x + side; cat.ty = Pl.y + 4;
    if (cat.t <= 0) cat.state = 'walk';
  }
  if (cat.state === 'sit') {
    if (cat.t <= 0 && !following) {
      cat.state = 'walk';
      cat.tx = Math.max(60, Math.min(OUT.W - 60, cat.x + (Math.random() - 0.5) * 220));
      cat.ty = Math.max(OUT.sw2B + 20, Math.min(OUT.H - 60, cat.y + (Math.random() - 0.5) * 140));
      cat.t = 8;
    }
    return;
  }
  const dx = cat.tx - cat.x, dy = cat.ty - cat.y, d = Math.hypot(dx, dy);
  const stopDist = following ? 10 : 2;
  if (d < stopDist || cat.t <= 0) {
    if (!following) { cat.state = 'sit'; cat.t = 2 + Math.random() * 5; }
    else cat.state = 'sit';
    return;
  }
  const sp = following ? Math.min(90, 30 + d * 1.5) : 22;
  const ox = cat.x, oy = cat.y;
  const saved = G.scene; G.scene = sc;
  moveActor(cat, dx / d * sp * dt, dy / d * sp * dt, 4);
  G.scene = saved;
  const moved = Math.hypot(cat.x - ox, cat.y - oy);
  cat.dist += moved;
  if (moved < 0.01 && !following) { cat.state = 'sit'; cat.t = 1 + Math.random() * 2; }
  if (Math.abs(dx) > 1) cat.face = dx > 0 ? 'right' : 'left';
}

function updateButterflies(dt) {
  for (const b of butterflies) {
    b.t += dt;
    const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
    if (d < 4 || Math.random() < dt * 0.2) {
      b.tx = b.hx + (Math.random() - 0.5) * 80; b.ty = b.hy - 10 + (Math.random() - 0.5) * 50;
    }
    if (d > 0.1) { b.x += dx / d * 18 * dt; b.y += dy / d * 18 * dt; }
    b.x += Math.sin(b.t * 7) * 0.3; b.y += Math.cos(b.t * 9) * 0.35;
    // flee from Lina a little
    const pd = Math.hypot(b.x - Pl.x, b.y - (Pl.y - 12));
    if (pd < 20 && G.scene.outdoor) { b.ty -= 30; b.tx += (b.x - Pl.x) * 2; }
  }
}

function spawnLeaves(dt) {
  if (!G.scene.outdoor || Math.random() > dt * 1.6) return;
  const trees = G.scene.objects.filter(o => o.tree && o.x > G.cam.x - 20 && o.x < G.cam.x + VW + 20 && o.y > G.cam.y && o.y < G.cam.y + VH + 60);
  if (!trees.length) return;
  const t = pick(Math.random, trees);
  G.particles.push({ kind: 'fallleaf', x: t.x + (Math.random() - 0.5) * 30, y: t.y - 40 - Math.random() * 10, vx: 4 + Math.random() * 6, vy: 10,
    g: 0, life: 4, max: 4, floor: t.y + Math.random() * 20, col: pick(Math.random, ['#e0a14a', '#c07234', '#9cc35e', '#f2c46a']) });
}

function updateWorld(dt) {
  G.t += dt;
  updateCat(dt);
  updateButterflies(dt);
  spawnLeaves(dt);
  updateParticles(dt);
  for (const o of G.scene.objects) {
    if (o.hop > 0) o.hop -= dt;
    if (o.amp !== undefined) {
      o.phase += dt * 3.2;
      if (!o.rider) o.amp = Math.max(0, o.amp - dt * 0.35);
    }
  }
  G.night += ((Pl.sleep ? 0.62 : 0) - G.night) * Math.min(1, dt * 1.5);
  if (G.shake > 0) G.shake -= dt;
  if (G.trans) {
    G.trans.t += dt;
    if (G.trans.t >= G.trans.dur) {
      if (G.trans.stage === 'out') { G.trans.cb(); G.trans.stage = 'in'; G.trans.t = 0; }
      else G.trans = null;
    }
  }
}

// -------------------------------------------------------------- camera -----
// The camera follows Lina's exact position plus a smoothed offset (snapped
// to device pixels), so she stays perfectly still on screen while the world
// glides underneath her in sub-pixel steps, in every direction.
function camFocusOffset() {
  let fx, fy;
  if (Pl.swing) { fx = Pl.swing.obj.x; fy = Pl.swing.obj.y - 20; }
  else if (Pl.sleep) { fx = Pl.sleep.bed.x + 20; fy = Pl.sleep.bed.y - 20; }
  else { fx = Pl.x + (Pl.riding ? Pl.vx * 0.35 : 0); fy = Pl.y - 14 + (Pl.riding ? Pl.vy * 0.3 : 0); }
  return [fx - Pl.x, fy - Pl.y];
}
function updateCamera(dt, snap = false) {
  const sc = G.scene, [ox, oy] = camFocusOffset();
  if (snap) { G.camOff.x = ox; G.camOff.y = oy; }
  else { const k = 1 - Math.exp(-dt * 4); G.camOff.x += (ox - G.camOff.x) * k; G.camOff.y += (oy - G.camOff.y) * k; }
  const halfW = Math.floor(cv.width / 2) / WS, halfH = Math.floor(cv.height / 2) / WS;
  let x = Pl.x + snapPx(G.camOff.x) - halfW;
  let y = Pl.y + snapPx(G.camOff.y) - halfH;
  x = sc.w <= VW ? snapPx((sc.w - VW) / 2) : Math.max(0, Math.min(sc.w - VW, x));
  y = sc.h <= VH ? snapPx((sc.h - VH) / 2) : Math.max(0, Math.min(sc.h - VH, y));
  G.cam.x = x; G.cam.y = y;
}
function snapCamera() { updateCamera(0, true); }

// -------------------------------------------------------------- render -----
function drawPlayer() {
  if (Pl.swing || Pl.sleep) return;
  const z = Pl.jump > 0 ? Math.sin(Math.PI * (1 - Pl.jump / 0.42)) * 7 : 0;
  let s;
  if (Pl.riding) s = SPR.rider[Pl.dir][Pl.frame];
  else if (Pl.blink > 0 && !Pl.moving) s = SPR.blink[Pl.dir];
  else s = SPR.lina[Pl.dir][Pl.frame];
  drawSprite(ctx, s, Pl.x, Pl.y - z);
}

function drawCat() {
  let s;
  if (cat.state === 'sit') s = cat.face === 'left' ? SPR.catSitLeft : SPR.cat.sit;
  else s = SPR.cat[cat.face][Math.floor(cat.dist / 4) % 4];
  drawSprite(ctx, s, cat.x, cat.y);
}

function render() {
  const sc = G.scene;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#120d12'; ctx.fillRect(0, 0, cv.width, cv.height);
  let cx = G.cam.x, cy = G.cam.y;
  if (G.shake > 0) { cx += Math.round((Math.random() - 0.5) * 4); cy += Math.round((Math.random() - 0.5) * 3); }
  ctx.setTransform(WS, 0, 0, WS, -Math.round(cx * WS), -Math.round(cy * WS));
  ctx.drawImage(sc.ground, 0, 0);

  // drawables
  const list = [];
  for (const o of sc.objects) list.push(o);
  if (bike.scene === sc.id) list.push({ y: bike.y, shadow: [14, 2], x: bike.x, draw() { drawSprite(ctx, SPR.bike[bike.face], bike.x, bike.y); } });
  if (!Pl.swing && !Pl.sleep) list.push({ y: Pl.y, x: Pl.x, shadow: Pl.riding ? (Pl.dir === 'left' || Pl.dir === 'right' ? [15, 2] : [6, 2]) : [6, 2], draw: drawPlayer });
  if (sc.outdoor) list.push({ y: cat.y, x: cat.x, shadow: [6, 1], draw: drawCat });

  // shadows
  for (const o of list) {
    if (o.shadowFn) o.shadowFn(ctx);
    else if (o.shadow) drawShadow(ctx, o.x, o.y, o.shadow[0], o.shadow[1]);
  }
  list.sort((a, b) => a.y - b.y);
  for (const o of list) {
    if (o.draw) o.draw(ctx, G.t);
    else {
      const hop = o.hop > 0 ? Math.round(Math.sin(Math.PI * o.hop / 0.4) * 4) : 0;
      drawSprite(ctx, o.spr, o.x, o.y - hop);
    }
  }

  // butterflies
  if (sc.outdoor) for (const b of butterflies) {
    const f = Math.sin(b.t * 22) > 0;
    const x = Math.round(b.x), y = Math.round(b.y);
    ctx.fillStyle = 'rgba(34,22,38,0.25)'; ctx.fillRect(x - 1, y + 14, 3, 1);
    ctx.fillStyle = '#2a1c18'; ctx.fillRect(x, y, 1, 2);
    ctx.fillStyle = b.col;
    if (f) { ctx.fillRect(x - 2, y - 1, 2, 2); ctx.fillRect(x + 1, y - 1, 2, 2); }
    else { ctx.fillRect(x - 1, y, 1, 2); ctx.fillRect(x + 1, y, 1, 2); }
  }

  drawParticles();

  // light
  ctx.globalCompositeOperation = 'lighter';
  for (const o of sc.objects) if (o.glow) glow(o.x, o.y + o.glow.dy, o.glow.r, '255,200,120', 0.16);
  for (const gl of sc.glows || []) glow(gl.x, gl.y, gl.r * (gl.flicker ? 1 + Math.sin(G.t * 13) * 0.05 + Math.sin(G.t * 7.3) * 0.04 : 1), gl.col, 0.28);
  if (!sc.outdoor) for (const wx of sc.windows) {
    ctx.fillStyle = 'rgba(255,240,200,0.07)';
    ctx.beginPath(); ctx.moveTo(wx + 2, 29); ctx.lineTo(wx + 22, 29); ctx.lineTo(wx + 62, sc.h - 20); ctx.lineTo(wx + 22, sc.h - 20); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 6; i++) {
      const k = (G.t * 0.05 + i * 0.17) % 1, x = wx + 10 + k * 40 + Math.sin(G.t + i) * 5, y = 32 + k * (sc.h - 60);
      ctx.fillStyle = 'rgba(255,245,210,0.5)'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // drifting cloud shadows
  if (sc.outdoor && cloudTex) {
    const ox = ((G.t * 6) % 512), oy = ((G.t * 2.5) % 512);
    for (let x = -512 + ox; x < sc.w; x += 512) for (let y = -512 + oy; y < sc.h; y += 512) {
      if (x + 512 < cx || x > cx + VW || y + 512 < cy || y > cy + VH) continue;
      ctx.drawImage(cloudTex, Math.round(x), Math.round(y));
    }
  }

  // interaction prompt
  if (G.target && G.started) {
    const t = G.target, bob = Math.round(Math.sin(G.t * 5) * 1.5);
    drawSprite(ctx, Input.device === 'keyboard' ? SPR.icon.key : SPR.icon.pad, t.ix ?? t.x, targetTop(t) - 4 + bob);
  }

  // colour grading, vignette, fades (screen space, in game pixels)
  ctx.setTransform(WS, 0, 0, WS, 0, 0);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = sc.outdoor ? 'rgba(255,196,140,0.45)' : 'rgba(255,170,110,0.5)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(vignette, 0, 0, VW, VH);
  if (G.night > 0.01) {
    ctx.fillStyle = `rgba(16,18,58,${G.night})`; ctx.fillRect(0, 0, VW, VH);
    if (Pl.sleep) { // a soft moonbeam on the bed
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(Pl.sleep.bed.x - cx, Pl.sleep.bed.y - 26 - cy, 44, '120,140,255', 0.18 * G.night);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  if (G.trans) {
    const k = G.trans.stage === 'out' ? G.trans.t / G.trans.dur : 1 - G.trans.t / G.trans.dur;
    const px = Pl.x - cx, py = Pl.y - 14 - cy;
    const rad = (1 - Math.min(1, k)) * Math.hypot(VW, VH);
    ctx.fillStyle = '#120d12';
    ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.arc(px, py, Math.max(0, rad), 0, Math.PI * 2, true); ctx.fill();
  }
}

// Radial light blobs are pre-rendered once per colour and scaled on draw.
const _glowCache = {};
function drawGlow(x, y, r, rgb, a) {
  let c = _glowCache[rgb];
  if (!c) {
    const [cc, g] = makeCanvas(64, 64);
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, `rgba(${rgb},1)`); grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    c = _glowCache[rgb] = cc;
  }
  ctx.globalAlpha = a;
  ctx.drawImage(c, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}
const glow = drawGlow;

// ---------------------------------------------------------------- loop -----
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  tick(dt);
  requestAnimationFrame(loop);
}

function tick(dt) {
  Input.update();
  if (!G.started) {
    if (Input.any) startGame();
  } else {
    if (Input.pressed('music')) document.body.classList.toggle('muted', !Sound.toggleMusic());
    if (Input.pressed('help')) { const h = document.getElementById('help'); h.style.opacity = h.style.opacity === '1' ? 0 : 1; }
    if (!G.trans) updatePlayer(dt);
  }
  updateWorld(dt);
  G.target = G.started ? findTarget() : null;
  updateCamera(dt);
  render();
  Input.endFrame();
}

init();
