'use strict';
// ---------------------------------------------------------------------------
// The kindergarten (Kita) behind the building site. Ring the bell and the
// door buzzes open. Inside: the porch where bikes and prams are parked, the
// hallway with the cloakroom, the panda group, the stairs up to the badger
// group, and the garden with a sandpit, a water tap, swings and a climbing
// frame. Other children play everywhere.
// ---------------------------------------------------------------------------

const KITA = { cx: 1560, W: 192, obj: null, doorX: 0 };
const KITA_LETTERS = {
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
};
const RAINBOW = ['#e5484d', '#ff9a4a', '#ffd35a', '#4fb35a', '#4a8ad0', '#8a6ad8'];

// ---- the other children -----------------------------------------------------
// Each child is drawn with Lina's own sprite code in their own colours.
const KID_LOOKS = [
  { hair: '#d9b060', skin: '#f7d4b6', top: '#6fc2a8', shirt: '#f7b6cf', pants: '#4a6aa0', shoe: '#e5484d', style: 'pigtails', band: '#f28bb0' },
  { hair: '#1d1418', skin: '#a8704a', top: '#ffd35a', shirt: '#e5484d', pants: '#3a3a48', shoe: '#4a8ad0', style: 'short' },
  { hair: '#b0502a', skin: '#f7d4b6', top: '#4a8ad0', shirt: '#fff0c4', pants: '#6b4a3a', shoe: '#3a3540', style: 'short' },
  { hair: '#5a3422', skin: '#e0b08a', top: '#c86ad8', shirt: '#8fc4ff', pants: '#f1e2de', shoe: '#f28bb0', style: 'loose' },
  { hair: '#c89048', skin: '#c68c64', top: '#e5484d', shirt: '#f4f1ea', pants: '#4a6aa0', shoe: '#ffd35a', style: 'pigtails', band: '#ffd35a' },
  { hair: '#e8cc84', skin: '#f7d4b6', top: '#8a6ad8', shirt: '#a8d88a', pants: '#3a3a48', shoe: '#4fb35a', style: 'short' },
  { hair: '#7a4a2a', skin: '#f0c8a8', top: '#ff9a6a', shirt: '#8fc4ff', pants: '#2f5f96', shoe: '#e5484d', style: 'loose' },
  { hair: '#1d1418', skin: '#8a5a3c', top: '#4fb35a', shirt: '#ffd35a', pants: '#f1e2de', shoe: '#c86ad8', style: 'loose' },
];

function kidPalette(k) {
  return {
    hair: k.hair, hairHi: shade(k.hair, 0.3), hairDk: shade(k.hair, -0.35),
    skin: k.skin, skinSh: shade(k.skin, -0.1), blush: shade(k.skin, -0.13),
    vest: k.top, vestSh: shade(k.top, -0.22), vestHi: shade(k.top, 0.25),
    fur: shade(k.top, 0.4), furSh: shade(k.top, 0.2), furHi: shade(k.top, 0.6), zip: shade(k.top, -0.35),
    sw: k.shirt, swSh: shade(k.shirt, -0.2), swDot: shade(k.shirt, 0.45),
    pants: k.pants, pantsSh: shade(k.pants, -0.18), dot: shade(k.pants, -0.1),
    shoe: k.shoe, shoeDk: shade(k.shoe, -0.3),
  };
}

const _kidCache = new Map();
function kidSprites(k) {
  let S = _kidCache.get(k);
  if (S) return S;
  const keepLC = Object.assign({}, LC), keepHair = HAIR, keepBand = Object.assign({}, SCRUNCHIE);
  Object.assign(LC, kidPalette(k));
  if (k.band) Object.assign(SCRUNCHIE, { lilac: k.band, mint: k.band });
  try {
    const set = buildLinaSet(k.style);
    const b = k.top;
    S = {
      walk: set.lina, blink: set.blink, sit: set.linaSit, skin: k.skin,
      sleeper: { head: set.sleepHead, skin: k.skin, phase: Math.random() * 6, blanket: [b, shade(b, 0.06), shade(b, 0.35), shade(b, -0.12), shade(b, -0.06), shade(b, -0.25)] },
    };
  } finally {
    Object.assign(LC, keepLC); HAIR = keepHair; Object.assign(SCRUNCHIE, keepBand);
  }
  _kidCache.set(k, S);
  return S;
}

const faceTo = (from, x, y) => {
  const dx = x - from.x, dy = y - from.y;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
};

// A child. 'wander' walks around `area` now and then; 'stay' keeps to one
// spot (at a table, by the toys) and looks around, hopping when `play`.
function makeKid(look, x, y, o = {}) {
  const S = kidSprites(look);
  return {
    x, y, kid: true, S, dir: o.dir || 'down', mode: o.mode || 'stay', area: o.area, looks: o.looks || [o.dir || 'down'], play: o.play,
    state: 'idle', t: 1 + Math.random() * 3, tx: x, ty: y, dist: 0, moving: false, blink: 0, blinkT: 1 + Math.random() * 3, happy: 0, hop: 0,
    shadow: [6, 2],
    get top() { return this.y - 32; },
    update(dt) {
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = 0.13; this.blinkT = 2 + Math.random() * 3; }
      if (this.blink > 0) this.blink -= dt;
      this.moving = false;
      if (this.happy > 0) { this.happy -= dt; return; }
      this.t -= dt;
      if (this.state === 'walk') {
        const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.hypot(dx, dy);
        if (d < 2 || this.t <= 0) { this.state = 'idle'; this.t = 1.5 + Math.random() * 4; return; }
        const ox = this.x, oy = this.y;
        moveActor(this, dx / d * 28 * dt, dy / d * 28 * dt, 4, true);
        const m = Math.hypot(this.x - ox, this.y - oy);
        if (m < 0.01) { this.state = 'idle'; this.t = 0.5 + Math.random(); return; }
        this.dist += m; this.moving = true;
        this.dir = faceTo(this, this.tx, this.ty);
        return;
      }
      // idle: look at Lina when she comes close, otherwise look around
      if (Math.hypot(Pl.x - this.x, Pl.y - this.y) < 32) { this.dir = faceTo(this, Pl.x, Pl.y); return; }
      if (this.t > 0) return;
      if (this.mode === 'wander') {
        const a = this.area;
        for (let i = 0; i < 8; i++) {
          const tx = a.x0 + Math.random() * (a.x1 - a.x0), ty = a.y0 + Math.random() * (a.y1 - a.y0);
          if (!blocked(G.scene, tx, ty, 4)) { this.tx = tx; this.ty = ty; this.state = 'walk'; this.t = 6; return; }
        }
        this.t = 1;
      } else {
        this.dir = pick(Math.random, this.looks);
        this.t = 1.5 + Math.random() * 3;
        if (this.play && Math.random() < 0.5) this.hop = 0.4;
      }
    },
    draw(ctx) {
      const z = this.hop > 0 ? Math.sin(Math.PI * this.hop / 0.4) * 5 : 0;
      let s;
      if (this.moving) s = S.walk[this.dir][Math.floor(this.dist / 7) % 4];
      else if (this.blink > 0) s = S.blink[this.dir];
      else s = S.walk[this.dir][0];
      drawSprite(ctx, s, this.x, this.y - z);
    },
    interact(o) {
      o.happy = 1.2; o.hop = 0.4; o.state = 'idle'; o.t = 1;
      o.dir = faceTo(o, Pl.x, Pl.y);
      Sound.giggle(0.9 + Math.random() * 0.3);
      burst(o.x, o.y - 32, 'heart', 3);
    },
  };
}

// ---- signs: a panda and a badger ------------------------------------------
function drawPanda(g, cx, cy) {
  const k = '#2b2b30';
  disc(g, cx - 4, cy - 4, 2, k); disc(g, cx + 4, cy - 4, 2, k);
  oval(g, cx, cy, 6, 5, '#fbfbf6');
  oval(g, cx - 3, cy, 1, 2, k); oval(g, cx + 3, cy, 1, 2, k);
  P(g, cx - 3, cy - 1, '#ffffff'); P(g, cx + 3, cy - 1, '#ffffff');
  R(g, cx - 1, cy + 2, 3, 1, k); P(g, cx, cy + 3, k);
  P(g, cx - 5, cy + 2, '#f7b6cf'); P(g, cx + 5, cy + 2, '#f7b6cf');
}
function drawBadger(g, cx, cy) {
  const k = '#2b2b30', w = '#f4f1ea';
  disc(g, cx - 4, cy - 4, 2, k); disc(g, cx + 4, cy - 4, 2, k); P(g, cx - 5, cy - 5, w); P(g, cx + 5, cy - 5, w);
  oval(g, cx, cy, 6, 5, '#9a9698');
  for (const sd of [-1, 1]) line(g, cx + sd * 2, cy - 5, cx + sd * 3, cy + 2, k, 2);
  R(g, cx - 1, cy - 5, 2, 9, w); R(g, cx - 1, cy - 5, 1, 9, '#ffffff');
  P(g, cx - 3, cy - 1, '#ffffff'); P(g, cx + 3, cy - 1, '#ffffff');
  P(g, cx - 5, cy + 1, w); P(g, cx + 5, cy + 1, w);
  R(g, cx - 1, cy + 3, 3, 2, k);
}
const pandaSign = (g, cx, cy) => { disc(g, cx, cy, 7, '#5f8f45'); disc(g, cx, cy, 6, '#8fc46a'); drawPanda(g, cx, cy + 1); };
const badgerSign = (g, cx, cy) => { disc(g, cx, cy, 7, '#a0703e'); disc(g, cx, cy, 6, '#f7d9a0'); drawBadger(g, cx, cy + 1); };
function poster(g, x, y, bg, face) {
  R(g, x, y, 26, 20, '#c49a62'); R(g, x + 1, y + 1, 24, 18, bg); R(g, x + 1, y + 14, 24, 5, shade(bg, -0.2));
  face(g, x + 13, y + 9);
}

// ---- the building ------------------------------------------------------------
function makeKita() {
  const W = KITA.W, OV = 4, CW = W + OV * 2, roofTop = 14, wallTop = 38, mid = 78, wallBot = 122;
  const dc = OV + W / 2, D = { x: dc - 10, y: wallBot - 30, w: 20, h: 30 };
  const s = sprite(CW, wallBot + 2, CW / 2, wallBot, g => {
    const r = rng(808);
    // a low tiled roof with two roof windows
    const rb = '#d0643e', rl = shade(rb, 0.18), rd = shade(rb, -0.28), rdd = shade(rb, -0.5);
    for (let y = roofTop, row = 0; y < wallTop; y += 5, row++) {
      R(g, 0, y, CW, 5, rb); R(g, 0, y, CW, 1, rl); R(g, 0, y + 4, CW, 1, rd);
      for (let x = (row % 2) * 4; x < CW; x += 8) R(g, x, y + 1, 1, 3, rd);
      for (let i = 0; i < CW / 9; i++) R(g, r() * CW | 0, y + 1, 3, 2, r() < 0.5 ? shade(rb, 0.08) : shade(rb, -0.1));
    }
    R(g, 0, roofTop - 4, CW, 5, rd); R(g, 0, roofTop - 4, CW, 1, rl);
    for (let x = 2; x < CW; x += 6) P(g, x, roofTop - 2, rdd);
    R(g, 0, roofTop - 4, 2, wallTop - roofTop + 4, rl); R(g, CW - 2, roofTop - 4, 2, wallTop - roofTop + 4, rdd);
    R(g, 0, wallTop - 2, CW, 2, rdd);
    for (const fx of [0.3, 0.7]) {
      const x = OV + Math.round(W * fx) - 6, y = roofTop + 3;
      R(g, x, y, 12, 10, '#4a4550'); R(g, x + 1, y + 1, 10, 8, '#8fc4ff'); R(g, x + 1, y + 1, 10, 3, '#cfeaf8'); R(g, x + 6, y + 1, 1, 8, '#4a4550');
    }
    // sunny plaster
    const pl = '#f6d98a';
    R(g, OV, wallTop, W, wallBot - wallTop, pl);
    for (let i = 0; i < W * 3; i++) P(g, OV + (r() * W | 0), wallTop + (r() * (wallBot - wallTop) | 0), r() < 0.5 ? shade(pl, -0.07) : shade(pl, 0.12));
    R(g, OV, wallTop, 2, wallBot - wallTop, shade(pl, 0.2)); R(g, OV + W - 2, wallTop, 2, wallBot - wallTop, shade(pl, -0.15));
    R(g, OV, wallTop, W, 4, 'rgba(50,25,20,0.25)');
    // a rainbow band between the floors, and a big painted rainbow upstairs
    for (let x = OV; x < OV + W; x += 8) R(g, x, mid, 8, 3, RAINBOW[((x - OV) / 8) % RAINBOW.length]);
    R(g, OV, mid + 3, W, 1, 'rgba(60,30,20,0.2)');
    for (let y = mid - 30; y < mid - 2; y++) for (let x = dc - 28; x <= dc + 28; x++) {
      const d = Math.hypot(x - dc, (y - (mid - 3)) * 1.1), i = Math.floor((26 - d) / 3);
      if (d <= 26 && i >= 0 && i < RAINBOW.length) P(g, x, y, RAINBOW[i]);
    }
    for (const sd of [-1, 1]) { disc(g, dc + sd * 19, mid - 5, 3, '#ffffff'); disc(g, dc + sd * 23, mid - 4, 2, '#ffffff'); disc(g, dc + sd * 15, mid - 4, 2, '#ffffff'); }
    // windows: upstairs, and downstairs with paper stars and flowers stuck on the glass
    const frames = ['#e5484d', '#4a8ad0', '#4fb35a', '#ff9a4a'];
    const win = (cx, y, w, h, col, deco) => {
      const x = cx - w / 2;
      R(g, x - 1, y - 1, w + 2, h + 2, shade(col, -0.35)); R(g, x, y, w, h, col);
      R(g, x + 2, y + 2, w - 4, h - 4, '#9fd3f0'); R(g, x + 2, y + 2, w - 4, 4, '#cfeaf8');
      R(g, cx - 1, y + 2, 2, h - 4, col);
      P(g, x + 3, y + 3, '#ffffff'); P(g, x + 4, y + 3, '#ffffff');
      R(g, x - 2, y + h, w + 4, 2, '#fbf6ee');
      if (deco) for (let i = 0; i < 3; i++) {
        const px = x + 4 + (r() * (w - 8) | 0), py = y + 6 + (r() * (h - 10) | 0), c = pick(r, RAINBOW);
        P(g, px, py - 1, c); P(g, px - 1, py, c); P(g, px + 1, py, c); P(g, px, py + 1, c); P(g, px, py, '#fff6b0');
      }
    };
    [0.1, 0.27, 0.73, 0.9].forEach((fx, i) => win(OV + Math.round(W * fx), wallTop + 10, 18, 20, frames[i], false));
    [0.1, 0.27, 0.73, 0.9].forEach((fx, i) => win(OV + Math.round(W * fx), mid + 11, 18, 18, frames[3 - i], true));
    // colourful handprints next to the door
    for (const [hx, hy] of [[dc - 38, 94], [dc - 30, 104], [dc + 28, 92], [dc + 34, 103]]) bitmap(g, BMP.hand, hx, hy, pick(r, RAINBOW));
    // foundation and the glass door
    R(g, OV, wallBot - 6, W, 6, '#8d8781'); R(g, OV, wallBot - 6, W, 1, '#aaa49d');
    for (let x = OV + 5; x < OV + W; x += 10) R(g, x, wallBot - 5, 1, 5, '#6c6661');
    R(g, D.x - 2, D.y - 1, D.w + 4, D.h + 1, '#2a4a70');
    R(g, D.x, D.y, D.w, D.h, '#2f5f96'); R(g, D.x + 2, D.y + 2, D.w - 4, D.h - 2, '#9fc9de'); R(g, D.x + 2, D.y + 2, D.w - 4, 6, '#cfeaf8');
    line(g, D.x + 4, D.y + 14, D.x + 9, D.y + 5, '#e4f5fb');
    R(g, D.x + 3, D.y + 15, D.w - 6, 1, '#c0c4ca'); R(g, D.x + 3, D.y + 21, D.w - 6, 1, '#c0c4ca');
    disc(g, D.x + 13, D.y + 25, 2, '#ffd35a');
    R(g, D.x - 4, wallBot - 2, D.w + 8, 2, '#b0aaa2');
    // canopy over the door with KITA on it
    R(g, dc - 18, D.y - 11, 36, 1, '#3c8a46'); R(g, dc - 18, D.y - 10, 36, 7, '#fbf6ee'); R(g, dc - 18, D.y - 3, 36, 1, '#3c8a46');
    R(g, dc - 18, D.y - 2, 36, 1, 'rgba(0,0,0,0.25)');
    ['K', 'I', 'T', 'A'].forEach((ch, i) => bitmap(g, KITA_LETTERS[ch], dc - 7 + i * 4, D.y - 9, RAINBOW[[0, 4, 3, 1][i]]));
    // the bell plate right of the door
    R(g, dc + 12, D.y + 8, 6, 11, '#8a6a2a'); R(g, dc + 13, D.y + 9, 4, 9, '#d9b45a');
    R(g, dc + 13, D.y + 10, 4, 2, '#fbf6ee'); disc(g, dc + 15, D.y + 15, 1, '#fbf6ee'); P(g, dc + 15, D.y + 15, '#e5484d');
    // flower pots either side
    for (const px of [dc - 22, dc + 20]) {
      R(g, px, wallBot - 8, 7, 7, '#c0683f'); R(g, px - 1, wallBot - 9, 9, 2, '#d8804f');
      for (let i = 0; i < 5; i++) P(g, px + i + 1, wallBot - 11 - (i % 2), '#4f8a3a');
      P(g, px + 1, wallBot - 13, '#e5484d'); P(g, px + 4, wallBot - 14, '#ffd35a'); P(g, px + 6, wallBot - 12, '#f28bb0');
    }
  });
  s.door = D; s.bell = { x: dc + 15, y: D.y + 15 };
  s.dx = dc - CW / 2; s.W = W;
  return s;
}

// Puts the building on the street: locked door, bell, fences, front garden.
function buildKitaOutside(sc, add) {
  const s = makeKita(), cx = KITA.cx, hw = s.W / 2, base = OUT.base;
  const doorX = KITA.doorX = cx + s.dx;
  frontGarden(sc.ground.getContext('2d'), rng(321), cx, hw);
  for (const [x0, x1] of [[cx - hw - 6, cx - 12], [cx + 13, cx + hw + 6]]) {
    add(obj(x0, OUT.sw1 - 2, makeFence(x1 - x0), { solid: { x: x0, y: OUT.sw1 - 6, w: x1 - x0, h: 4 } }));
  }
  const kita = KITA.obj = add(obj(cx, base, s, {
    solid: { x: cx - hw, y: base - 44, w: s.W, h: 44 },
    shadowFn: ctx => { ctx.fillStyle = 'rgba(34,22,38,0.22)'; ctx.fillRect(cx - hw + 2, base - 1, s.W + 4, 4); },
    ring: 0, open: 0, k: 0, hintT: -9,
    update(dt) {
      if (this.ring > 0) { this.ring -= dt; if (this.ring <= 0) { Sound.buzz(); this.open = 9; } }
      if (this.open > 0) { this.open -= dt; if (this.open <= 0) Sound.door(); }
      this.k += ((this.open > 0 ? 1 : 0) - this.k) * Math.min(1, dt * 6);
    },
    draw(ctx) {
      drawSprite(ctx, this.spr, this.x, this.y);
      const D = this.spr.door;
      if (this.k > 0.05) { // the door swings in: the hallway shows behind it
        const [x0, y0] = sprPx(this, D.x + 2, D.y + 2), iw = D.w - 4, ih = D.h - 2;
        ctx.fillStyle = '#5a4238'; ctx.fillRect(x0, y0, iw, ih);
        ctx.fillStyle = '#c9bca6'; ctx.fillRect(x0, y0 + ih - 7, iw, 7);
        ctx.fillStyle = '#f3e3b8'; ctx.fillRect(x0 + 3, y0 + 4, iw - 6, 8);
        const lw = Math.max(2, Math.round(iw * (1 - this.k * 0.8)));
        ctx.fillStyle = '#2f5f96'; ctx.fillRect(x0, y0 - 1, lw, ih + 1);
        if (lw > 3) { ctx.fillStyle = '#9fc9de'; ctx.fillRect(x0 + 1, y0 + 1, lw - 2, ih - 2); }
      }
      if (this.ring > 0 || this.open > 0) { // the bell button lights up
        const [bx, by] = sprPx(this, this.spr.bell.x, this.spr.bell.y);
        ctx.fillStyle = '#ffe36a'; ctx.fillRect(bx - 1, by, 3, 1); ctx.fillRect(bx, by - 1, 1, 3);
      }
    },
    glowFn() {
      if (this.ring > 0 || this.open > 0) { const [bx, by] = sprPx(this, this.spr.bell.x, this.spr.bell.y); glow(bx, by, 8, '255,220,120', 0.35); }
    },
  }));
  const [bellX, bellY] = sprPx(kita, s.bell.x, s.bell.y);
  add({
    x: bellX, y: base + 3, ix: bellX, iy: base + 4, top: bellY - 4,
    interact() {
      Sound.press();
      if (kita.ring > 0 || kita.open > 0) return;
      Sound.dingdong(); kita.ring = 1.4;
      burst(bellX, bellY - 6, 'note', 2);
    },
  });
  sc.doors.push({
    x: doorX - 8, y: base - 3, w: 16, h: 9, to: 'kitaVor', need: 'up',
    when: () => kita.k > 0.5,
    locked: () => {
      if (G.t - kita.hintT < 1.5) return;
      kita.hintT = G.t; Sound.rattle(); burst(bellX, bellY - 6, 'star', 2);
    },
  });
}

// ---- furniture and toys -----------------------------------------------------
function makeKidBike(frame) {
  const keep = Object.assign({}, BC);
  Object.assign(BC, { frame, frameHi: shade(frame, 0.3), frameSh: shade(frame, -0.3) });
  try { return sprite(34, 24, 17, 23, g => bikeSide(g, 0, 1, true)); } finally { Object.assign(BC, keep); }
}

function makeScooter() {
  return sprite(20, 22, 10, 21, g => {
    disc(g, 4, 18, 2, '#27242b'); disc(g, 16, 18, 2, '#27242b'); P(g, 4, 18, '#c0c4ca'); P(g, 16, 18, '#c0c4ca');
    R(g, 4, 15, 12, 2, '#4fb35a'); R(g, 4, 15, 12, 1, '#7fd88a');
    line(g, 15, 15, 14, 3, '#a3a8b0', 2); R(g, 10, 2, 9, 2, '#27242b'); R(g, 10, 2, 2, 2, '#e5484d'); R(g, 17, 2, 2, 2, '#e5484d');
  });
}

// A pram seen from the side, with a hood and a blanket peeking out.
function makePram(col) {
  return sprite(32, 28, 16, 27, g => {
    const d = shade(col, -0.25), hi = shade(col, 0.3);
    line(g, 8, 24, 13, 18, '#6c727a'); line(g, 22, 24, 17, 18, '#6c727a');
    for (const wx of [8, 22]) { disc(g, wx, 23, 3, '#27242b'); disc(g, wx, 23, 1, '#c0c4ca'); }
    oval(g, 14, 14, 11, 5, d); R(g, 3, 9, 23, 5, col); oval(g, 14, 13, 11, 4, col);
    R(g, 4, 10, 21, 1, hi);
    R(g, 11, 8, 12, 2, '#fbf6ee'); R(g, 12, 7, 5, 1, '#f7b6cf');
    for (let y = 1; y < 10; y++) { const w = Math.round(Math.sqrt(Math.max(0, 81 - (y - 10) * (y - 10)))); R(g, 3, y, w, 1, y % 3 ? d : shade(col, -0.4)); }
    line(g, 25, 12, 30, 3, '#3a3540'); R(g, 28, 2, 4, 2, '#3a3540');
  });
}

// A low bench for the cloakroom, with shoes lined up underneath.
function makeKidBench(len) {
  return sprite(len, 13, len / 2, 12, g => {
    const r = rng(len);
    R(g, 0, 0, len, 3, '#d0a878'); R(g, 0, 0, len, 1, '#e4c296'); R(g, 0, 3, len, 1, '#8a5a38');
    R(g, 1, 4, 2, 9, '#8a5a38'); R(g, len - 3, 4, 2, 9, '#8a5a38');
    R(g, 3, 8, len - 6, 1, '#a8744a');
    for (let x = 5; x < len - 8; x += 9) {
      const c = pick(r, ['#e5484d', '#4a8ad0', '#f28bb0', '#4fb35a', '#ffd35a']);
      R(g, x, 10, 3, 2, c); R(g, x + 4, 10, 3, 2, c); P(g, x, 10, shade(c, 0.4)); P(g, x + 4, 10, shade(c, 0.4));
    }
  });
}

// A small table with little chairs. kind: 'crayons' (paper and crayons),
// 'snack' (plates of apple slices and cups) or 'puzzle'.
function makeKidTable(kind) {
  return sprite(44, 24, 22, 23, g => {
    const top = '#e8c89a', edge = '#b98a5a';
    for (const cx of [2, 42]) { R(g, cx - 2, 8, 4, 12, '#4a8ad0'); R(g, cx - 2, 8, 4, 1, '#7ab8ff'); R(g, cx - 2, 19, 1, 4, '#2f5f96'); R(g, cx + 1, 19, 1, 4, '#2f5f96'); }
    R(g, 4, 14, 2, 9, '#8a5a38'); R(g, 38, 14, 2, 9, '#8a5a38');
    R(g, 3, 3, 38, 10, top); R(g, 3, 3, 38, 1, '#f6dcb4'); R(g, 3, 13, 38, 2, edge);
    if (kind === 'crayons') {
      R(g, 8, 5, 12, 7, '#ffffff'); R(g, 24, 6, 11, 6, '#fff6d8');
      ['#e5484d', '#4a8ad0', '#ffd35a', '#4fb35a'].forEach((c, i) => R(g, 22 + i * 3, 4, 1, 3, c));
      line(g, 26, 8, 32, 10, '#e5484d'); line(g, 26, 10, 30, 7, '#4a8ad0');
    } else if (kind === 'snack') {
      for (const [px, c] of [[10, '#e5484d'], [24, '#4fb35a']]) {
        oval(g, px, 8, 4, 2, '#ffffff'); P(g, px - 1, 8, '#f6e2a0'); P(g, px + 1, 7, '#f6e2a0'); P(g, px + 2, 8, c);
      }
      for (const px of [16, 32]) { R(g, px, 5, 3, 4, '#8fc4ff'); R(g, px, 5, 3, 1, '#cfeaf8'); }
    } else {
      for (let i = 0; i < 9; i++) R(g, 8 + (i % 5) * 5, 5 + (i / 5 | 0) * 4, 4, 3, pick(rng(i + 3), ['#e5484d', '#4a8ad0', '#ffd35a', '#4fb35a', '#c86ad8']));
    }
  });
}

function makeToyShelf() {
  return sprite(46, 28, 23, 27, g => {
    const w = '#c8955a', d = '#8a5a38';
    R(g, 0, 0, 46, 28, w); R(g, 0, 0, 46, 2, '#e0b47a'); R(g, 0, 26, 46, 2, d);
    R(g, 2, 3, 42, 10, '#6f4a2a'); R(g, 2, 15, 42, 10, '#6f4a2a'); R(g, 1, 13, 44, 2, '#e0b47a');
    ['#e5484d', '#4a8ad0', '#ffd35a'].forEach((c, i) => { R(g, 3 + i * 14, 17, 12, 8, c); R(g, 3 + i * 14, 17, 12, 1, shade(c, 0.35)); R(g, 7 + i * 14, 19, 4, 1, shade(c, -0.3)); });
    disc(g, 8, 9, 3, '#9a6b43'); disc(g, 6, 5, 1, '#9a6b43'); disc(g, 10, 5, 1, '#9a6b43'); P(g, 7, 8, '#1d130f'); P(g, 9, 8, '#1d130f');
    R(g, 16, 7, 9, 4, '#e5484d'); R(g, 22, 5, 3, 2, '#e5484d'); R(g, 17, 5, 4, 2, '#8fc4ff');
    P(g, 17, 11, '#27242b'); P(g, 23, 11, '#27242b');
    R(g, 30, 4, 3, 9, '#4fb35a'); R(g, 34, 6, 3, 7, '#c86ad8'); R(g, 38, 5, 4, 8, '#ff9a4a');
  });
}

function makeRockingHorse() {
  return sprite(30, 24, 15, 23, g => {
    const b = '#f2e6d0', sp = '#c9a078', mane = '#8a5a38';
    for (let x = 1; x < 29; x++) { const y = 20 + Math.round(Math.pow((x - 15) / 14, 2) * -3 + 2); R(g, x, y, 1, 2, '#a0703e'); }
    line(g, 8, 13, 6, 20, '#6f4a2a', 2); line(g, 20, 13, 23, 20, '#6f4a2a', 2);
    R(g, 7, 9, 15, 6, b); oval(g, 14, 12, 8, 3, b);
    P(g, 10, 11, sp); P(g, 15, 10, sp); P(g, 18, 12, sp);
    R(g, 11, 8, 6, 3, '#e5484d'); R(g, 11, 8, 6, 1, '#f58a8a');
    line(g, 21, 9, 24, 3, b, 3); R(g, 23, 1, 6, 4, b); R(g, 27, 3, 2, 2, '#e8d0c0'); P(g, 25, 2, '#1d130f');
    line(g, 21, 7, 23, 1, mane, 1); P(g, 22, 0, mane); line(g, 7, 10, 3, 15, mane, 2);
    R(g, 24, 5, 1, 4, '#4a8ad0');
  });
}

function makeMat(col) {
  return sprite(28, 38, 14, 37, g => {
    R(g, 1, 0, 26, 38, col); R(g, 0, 1, 28, 36, col);
    R(g, 1, 0, 26, 1, shade(col, 0.3)); R(g, 0, 36, 28, 1, shade(col, -0.3));
    for (let y = 3; y < 36; y += 3) { P(g, 2, y, shade(col, -0.2)); P(g, 25, y, shade(col, -0.2)); }
    R(g, 5, 3, 18, 10, '#fbf6ee'); R(g, 5, 12, 18, 1, '#d9d2c6'); R(g, 6, 4, 16, 1, '#ffffff');
  });
}

function makePlayKitchen() {
  return sprite(40, 36, 20, 35, g => {
    const w = '#bfe6d6', d = '#94c9b6';
    R(g, 0, 0, 40, 14, '#fbf6ee'); for (let x = 0; x < 40; x += 5) for (let y = 0; y < 14; y += 5) R(g, x, y, 1, 1, '#d9e8f0');
    R(g, 4, 2, 10, 2, '#8a5a38'); R(g, 6, 4, 2, 3, '#a3a8b0'); R(g, 10, 4, 2, 4, '#e0621a');
    R(g, 0, 14, 40, 22, w); R(g, 38, 14, 2, 22, d); R(g, 0, 34, 40, 2, d);
    R(g, 0, 14, 40, 4, '#e8e4dc'); R(g, 0, 14, 40, 1, '#ffffff');
    oval(g, 8, 16, 4, 1, '#3a3540'); oval(g, 18, 16, 4, 1, '#e5484d');
    R(g, 26, 15, 11, 3, '#9fb8c0'); R(g, 27, 15, 9, 2, '#cfeaf8'); R(g, 30, 11, 2, 4, '#a3a8b0'); R(g, 30, 11, 4, 1, '#a3a8b0');
    R(g, 3, 21, 18, 11, '#3a3540'); R(g, 4, 22, 16, 9, '#5a5560'); R(g, 5, 23, 6, 2, '#8a8490');
    R(g, 4, 19, 16, 1, d); for (const kx of [6, 10, 14, 18]) P(g, kx, 19, '#e5484d');
    R(g, 24, 21, 13, 11, d); R(g, 25, 22, 11, 9, w); R(g, 34, 25, 1, 3, '#a3a8b0');
    // the pot on the red hot plate
    R(g, 14, 10, 9, 6, '#a3a8b0'); R(g, 14, 10, 9, 1, '#c9ced4'); R(g, 13, 11, 1, 2, '#6c727a'); R(g, 23, 11, 1, 2, '#6c727a');
  });
}

function makeCastle(stage) {
  return sprite(34, 28, 17, 26, g => {
    const s = '#dcc48f', sd = '#c7ad78', sl = '#ead6a8';
    oval(g, 17, 23, 15, 3, sd); oval(g, 17, 22, 13, 2, s);
    const tower = (x, y, w, h) => {
      R(g, x, y, w, h, s); R(g, x, y, 1, h, sl); R(g, x + w - 1, y, 1, h, sd);
      for (let i = y + 3; i < y + h; i += 3) R(g, x + 1, i, w - 2, 1, sd);
      for (let i = 0; i < w; i += 2) P(g, x + i, y - 1, s);
    };
    if (stage >= 1) tower(12, 12, 10, 10);
    if (stage >= 2) tower(4, 14, 7, 8);
    if (stage >= 3) tower(23, 14, 7, 8);
    if (stage >= 4) {
      R(g, 15, 18, 4, 4, '#8a6a42'); P(g, 16, 17, '#8a6a42'); P(g, 17, 17, '#8a6a42');
      P(g, 7, 16, '#8a6a42'); P(g, 26, 16, '#8a6a42');
      line(g, 17, 3, 17, 11, '#6f4a2a'); poly(g, [[18, 3], [24, 5], [18, 7]], '#f28bb0');
      for (const [px, c] of [[5, '#fbf6ee'], [13, '#f7b6cf'], [28, '#8fc4ff']]) P(g, px, 21, c);
    }
    if (stage === 0) { oval(g, 17, 20, 7, 2, sl); P(g, 14, 19, sd); P(g, 19, 20, sd); }
  });
}

function makeBucket() {
  return sprite(18, 12, 9, 11, g => {
    poly(g, [[2, 3], [10, 3], [9, 11], [3, 11]], '#e5484d'); R(g, 2, 3, 8, 1, '#f58a8a'); R(g, 3, 6, 6, 1, '#b8322c');
    line(g, 2, 3, 6, 0, '#3a3540'); line(g, 6, 0, 10, 3, '#3a3540');
    line(g, 11, 10, 16, 5, '#4a8ad0', 2); R(g, 15, 2, 3, 4, '#4a8ad0');
  });
}

function makeTap() {
  return sprite(16, 32, 7, 31, g => {
    R(g, 0, 27, 14, 5, '#8d8781'); R(g, 0, 27, 14, 1, '#aaa49d'); R(g, 3, 28, 8, 3, '#6c6661');
    for (const [px, py] of [[4, 29], [7, 29], [9, 30]]) P(g, px, py, '#4a4550');
    R(g, 5, 4, 4, 24, '#8a5a38'); R(g, 5, 4, 1, 24, '#a8744a'); R(g, 8, 4, 1, 24, '#6f4a2a');
    R(g, 6, 7, 2, 3, '#a3a8b0'); R(g, 8, 8, 5, 2, '#a3a8b0'); R(g, 12, 9, 2, 3, '#a3a8b0'); R(g, 8, 8, 5, 1, '#c9ced4');
    R(g, 4, 5, 6, 1, '#d8322c'); R(g, 6, 3, 2, 5, '#d8322c'); P(g, 6, 3, '#f06a5a');
  });
}

// ---- interactive things -------------------------------------------------------
// A pram that rocks when Lina gives it a push.
function pramObj(x, y, col) {
  return obj(x, y, makePram(col), {
    shadow: [12, 2], solid: { x: x - 13, y: y - 3, w: 26, h: 3 }, rock: 0,
    draw(ctx) { drawSprite(ctx, this.spr, this.x + (this.rock > 0 ? Math.round(Math.sin(this.rock * 14) * 1.5) : 0), this.y); },
    update(dt) { if (this.rock > 0) this.rock -= dt; },
    interact: o => { o.rock = 1.6; Sound.giggle(1.5); burst(o.x - 2, o.y - 22, 'heart', 2); },
  });
}

function blockTower(x, y) {
  const cols = ['#e5484d', '#4a8ad0', '#ffd35a', '#4fb35a', '#ff9a4a', '#c86ad8'];
  const block = (ctx, bx, by, c) => {
    ctx.fillStyle = '#2a1c18'; ctx.fillRect(bx - 1, by - 1, 10, 7);
    ctx.fillStyle = c; ctx.fillRect(bx, by, 8, 5);
    ctx.fillStyle = shade(c, 0.35); ctx.fillRect(bx, by, 8, 1);
    ctx.fillStyle = shade(c, -0.25); ctx.fillRect(bx + 7, by + 1, 1, 4);
  };
  return {
    x, y, n: 2, shadow: [7, 2],
    get top() { return this.y - 10 - this.n * 6; },
    draw(ctx) {
      const X = Math.round(this.x), Y = Math.round(this.y);
      block(ctx, X - 16, Y - 5, cols[4]); block(ctx, X + 10, Y - 4, cols[5]);
      for (let i = 0; i < this.n; i++) {
        const wob = this.n >= 5 ? Math.round(Math.sin(G.t * 5 + i) * (i / this.n) * 1.4) : 0;
        block(ctx, X - 4 + wob + (i % 2 ? 1 : 0), Y - 6 - i * 6, cols[i % cols.length]);
      }
    },
    interact(o) {
      if (o.n >= 7) {
        Sound.clatter(); G.shake = 0.15;
        burst(o.x, o.y - 24, 'confetti', 16); burst(o.x, o.y - 30, 'star', 3);
        o.n = 0;
      } else { o.n++; Sound.click(o.n); burst(o.x, o.top + 6, 'star', 1); }
    },
  };
}

function rockingHorse(x, y) {
  return obj(x, y, makeRockingHorse(), {
    shadow: [12, 2], solid: { x: x - 12, y: y - 4, w: 24, h: 4 }, rock: 0, tick: 0,
    draw(ctx) {
      const a = this.rock > 0 ? Math.sin(this.rock * 7) : 0;
      drawSprite(ctx, this.spr, this.x + Math.round(a * 1.5), this.y - Math.round(Math.abs(a) * 1.5));
    },
    update(dt) {
      if (this.rock <= 0) return;
      this.rock -= dt; this.tick -= dt;
      if (this.tick <= 0) { this.tick = 0.45; Sound.creak(); }
    },
    interact: o => { o.rock = 3; burst(o.x, o.y - 26, 'heart', 2); },
  });
}

// The crayon table: every go adds a squiggle to the picture; five make it done.
function crayonTable(x, y) {
  return obj(x, y, makeKidTable('crayons'), {
    shadow: [20, 2], solid: { x: x - 20, y: y - 12, w: 40, h: 10 }, iy: y + 2, lines: [],
    draw(ctx) {
      drawSprite(ctx, this.spr, this.x, this.y);
      const [px, py] = sprPx(this, 8, 5);
      for (const [c, x0, y0, x1, y1] of this.lines) line(ctx, px + x0, py + y0, px + x1, py + y1, c);
    },
    interact(o) {
      const r = Math.random;
      o.lines.push([pick(r, RAINBOW), r() * 11 | 0, r() * 6 | 0, r() * 11 | 0, r() * 6 | 0]);
      Sound.scribble(); burst(o.x - 8, o.y - 20, 'confetti', 4);
      if (o.lines.length >= 5) { Sound.sparkle(); burst(o.x - 8, o.y - 24, 'heart', 3); burst(o.x - 8, o.y - 24, 'star', 3); o.lines = []; }
    },
  });
}

function snackTable(x, y) {
  return obj(x, y, makeKidTable('snack'), {
    shadow: [20, 2], solid: { x: x - 20, y: y - 12, w: 40, h: 10 }, iy: y + 2,
    interact: o => { Sound.yum(); burst(o.x, o.y - 22, 'heart', 2); burst(o.x, o.y - 20, 'crumb', 8); },
  });
}

function playKitchen(x, y) {
  return obj(x, y, makePlayKitchen(), {
    solid: { x: x - 20, y: WALL, w: 40, h: y - WALL }, iy: y + 6, cook: 0, puff: 0,
    update(dt) {
      if (this.cook <= 0) return;
      this.cook -= dt; this.puff -= dt;
      if (this.puff <= 0) { this.puff = 0.2; burst(this.x - 2, this.y - 30, 'dust', 1); }
      if (this.cook <= 0) { Sound.yum(); burst(this.x, this.y - 36, 'heart', 3); }
    },
    interact: o => { if (o.cook > 0) return; o.cook = 2.2; Sound.bubble(); },
  });
}

function toyShelf(x, y) {
  return obj(x, y, makeToyShelf(), {
    solid: { x: x - 23, y: WALL, w: 46, h: y - WALL }, iy: y + 6,
    interact: o => { Sound.pop(); Sound.sparkle(); burst(o.x, o.y - 30, 'star', 5); burst(o.x, o.y - 26, 'confetti', 10); },
  });
}

// A mat on the floor for the afternoon nap. With `sleeper` a child already
// sleeps on it; otherwise Lina can lie down.
function matObj(x, y, col, sleeper = null) {
  const spr = makeMat(col);
  return {
    x, y, ix: x, iy: y - 18, top: y - 42, sleeper, zT: Math.random() * 1.4,
    floor(ctx) {
      drawSprite(ctx, spr, this.x, this.y);
      if (this.sleeper) drawSleeper(this, this.sleeper);
      else if (Pl.sleep && Pl.sleep.bed === this) drawSleeper(this);
    },
    update(dt) {
      if (!this.sleeper) return;
      this.zT -= dt;
      if (this.zT <= 0) { this.zT = 1.3; burst(this.x + 4, this.y - 34, 'z', 1); }
    },
    interact: o => { if (o.sleeper) { Sound.shh(); burst(o.x, o.y - 38, 'z', 2); } else startSleep(o); },
  };
}

// The cloakroom bench: Lina sits down anywhere along it (another child may
// already sit at the end, swinging its legs).
function benchObj(x, y, len, kid = null) {
  const hw = len / 2 - 8;
  const b = obj(x, y, makeKidBench(len), {
    solid: { x: x - len / 2, y: y - 5, w: len, h: 5 }, iy: y + 3, top: y - 30,
    seat: [-hw, kid ? kid.dx - 16 : hw],
    draw(ctx) {
      drawSprite(ctx, this.spr, this.x, this.y);
      if (kid) drawSprite(ctx, kid.S.sit, this.x + kid.dx, this.y - 6 - (Math.sin(G.t * 3 + 1) > 0.7 ? 1 : 0));
      if (Pl.sit && Pl.sit.obj === this) drawSprite(ctx, SPR.linaSit, Pl.x, this.y - 6);
    },
    interact: o => startSit(o),
  });
  // the prompt shows up right where Lina would sit down
  Object.defineProperty(b, 'ix', { get() { return this.x + Math.max(this.seat[0], Math.min(this.seat[1], Pl.x - this.x)); } });
  return b;
}

// A ball: walk into it to nudge it, or kick it properly. It bounces off
// the walls and the furniture, and the children kick it back.
function ballObj(x, y) {
  return {
    x, y, vx: 0, vy: 0, z: 0, vz: 0, shadow: [4, 1],
    get top() { return this.y - 12 - this.z; },
    kick(fx, fy, sp) {
      const dx = this.x - fx, dy = this.y - fy, d = Math.hypot(dx, dy) || 1;
      this.vx = dx / d * sp; this.vy = dy / d * sp; this.vz = 50 + sp * 0.3;
      Sound.kick();
    },
    update(dt) {
      const sp = Math.hypot(this.vx, this.vy);
      if (sp < 30 && Pl.moving && !Pl.riding && Math.hypot(Pl.x - this.x, Pl.y - this.y) < 8) this.kick(Pl.x, Pl.y, 80);
      if (sp < 15) for (const o of G.scene.objects) {
        if (o.kid && Math.hypot(o.x - this.x, o.y - this.y) < 10) { this.kick(o.x - (Math.random() - 0.5) * 8, o.y, 90); o.hop = 0.4; break; }
      }
      const hit = moveActor(this, this.vx * dt, this.vy * dt, 3);
      if (hit.hitX) { this.vx *= -0.7; if (sp > 20) Sound.click(-6); }
      if (hit.hitY) { this.vy *= -0.7; if (sp > 20) Sound.click(-6); }
      if (this.y > G.scene.h - 12) { this.y = G.scene.h - 12; this.vy = -Math.abs(this.vy) * 0.7; } // not out through the door
      const f = Math.exp(-dt * 1.3);
      this.vx *= f; this.vy *= f;
      if (Math.hypot(this.vx, this.vy) < 1) this.vx = this.vy = 0;
      this.vz -= 320 * dt; this.z += this.vz * dt;
      if (this.z < 0) { this.z = 0; this.vz = Math.abs(this.vz) > 25 ? -this.vz * 0.45 : 0; }
    },
    draw(ctx) {
      const X = Math.round(this.x), Y = Math.round(this.y - this.z) - 3;
      ctx.fillStyle = '#2a1c18'; ctx.fillRect(X - 3, Y - 4, 7, 9); ctx.fillRect(X - 4, Y - 3, 9, 7);
      ctx.fillStyle = '#e5484d'; ctx.fillRect(X - 2, Y - 3, 5, 7); ctx.fillRect(X - 3, Y - 2, 7, 5);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(X - 3, Y, 7, 1);
      ctx.fillStyle = '#ffd35a'; ctx.fillRect(X - 2, Y + 2, 5, 1);
      ctx.fillStyle = '#ffb0b0'; ctx.fillRect(X - 1, Y - 2, 1, 1);
    },
    interact(o) { const [dx, dy] = DIRV[Pl.dir]; o.kick(o.x - dx * 10, o.y - dy * 10, 150); burst(o.x, o.y - 10, 'star', 2); },
  };
}

// ---- the rooms -----------------------------------------------------------------
function buildKita() {
  const rooms = {};
  const kid = (i, x, y, o) => makeKid(KID_LOOKS[i], x, y, o);
  const hallDoors = { panda: 124, garden: 180, stairs: 236 };

  // the porch: park bikes, scooters and prams here
  const bikes = [makeKidBike('#4a8ad0'), makeKidBike('#4fb35a')];
  const ringBell = o => { Sound.bell(); burst(o.x + 8, o.y - 26, 'note', 2); };
  rooms.kitaVor = buildRoom('kitaVor', {
    w: 208, h: 150, seed: 41, floor: '#c9bca6', floorKind: 'tiles', surface: 'tile', wall: '#f3e3b8', pattern: 'hands', curtain: '#8fc4ff',
    windows: [16, 168], bikes: true,
    exit: { to: 'out', at: { x: KITA.doorX, y: OUT.base + 12, dir: 'down' }, onUse: () => { KITA.obj.open = Math.max(KITA.obj.open, 1.6); KITA.obj.k = 1; } },
    doors: [{ x: 104, to: 'kitaFlur', col: '#8fc4ff' }],
    decorate(g, r) {
      R(g, 54, 9, 32, 20, '#8a6a42'); R(g, 55, 10, 30, 18, '#c49a62');
      for (let i = 0; i < 5; i++) {
        const px = 57 + (i % 3) * 9 + (r() * 2 | 0), py = 12 + (i / 3 | 0) * 8;
        R(g, px, py, 7, 6, pick(r, ['#fbf6ee', '#fff1a8', '#d8f0ff'])); P(g, px + 3, py, pick(r, RAINBOW));
        R(g, px + 1, py + 2, 4, 1, '#b8b2a6'); R(g, px + 1, py + 4, 3, 1, '#b8b2a6');
      }
      for (let i = 0; i < 3; i++) {
        const px = 122 + i * 12, py = 10 + (i % 2) * 3;
        R(g, px, py, 10, 12, '#ffffff'); P(g, px + 5, py, '#e5484d');
        disc(g, px + 3, py + 3, 1, '#ffd35a'); R(g, px + 1, py + 9, 8, 2, '#76a54a');
        R(g, px + 5, py + 5, 4, 4, pick(r, ['#e5484d', '#4a8ad0', '#f28bb0'])); P(g, px + 6, py + 4, '#8a5a38');
      }
    },
  }, [
    obj(34, 76, bikes[0], { shadow: [14, 2], solid: { x: 20, y: 73, w: 28, h: 3 }, interact: ringBell }),
    obj(40, 106, mirrorSprite(bikes[1]), { shadow: [14, 2], solid: { x: 26, y: 103, w: 28, h: 3 }, interact: ringBell }),
    obj(72, 70, makeScooter(), { shadow: [8, 1], solid: { x: 64, y: 67, w: 16, h: 3 }, interact: o => { Sound.squeak(); burst(o.x, o.y - 22, 'star', 2); } }),
    pramObj(162, 74, '#f28bb0'),
    pramObj(176, 108, '#6f9fc8'),
  ]);

  // the hallway: cloakroom and bench, the panda group, the garden, the stairs
  const flurKid = { S: kidSprites(KID_LOOKS[2]), dx: 26 };
  rooms.kitaFlur = buildRoom('kitaFlur', {
    w: 288, h: 150, seed: 42, floor: '#9ec2a8', floorKind: 'lino', surface: 'tile', wall: '#fbeccd', pattern: 'dots', curtain: '#8fc4ff',
    windows: [],
    exit: { to: 'kitaVor', at: { x: 104, y: WALL + 14, dir: 'down' } },
    doors: [
      { x: hallDoors.panda, to: 'kitaPanda', col: '#8fc46a', sign: pandaSign },
      { x: hallDoors.garden, to: 'kitaGarten', look: 'glass' },
      { x: hallDoors.stairs, to: 'kitaOG', look: 'stairs', sound: 'stairs' },
    ],
    decorate(g, r) {
      // the cloakroom: a hat shelf, and a hook with a picture for every child
      R(g, 10, 5, 86, 2, '#d0a878'); R(g, 10, 7, 86, 1, '#8a5a38');
      const pics = [
        (x, y) => disc(g, x + 4, y + 3, 2, '#ffd35a'),
        (x, y) => bitmap(g, BMP.star, x + 2, y + 1, '#ffb020'),
        (x, y) => { R(g, x + 2, y + 1, 2, 2, '#e8507e'); R(g, x + 5, y + 1, 2, 2, '#e8507e'); R(g, x + 2, y + 2, 5, 2, '#e8507e'); P(g, x + 4, y + 4, '#e8507e'); },
        (x, y) => { oval(g, x + 4, y + 3, 2, 1, '#4a8ad0'); P(g, x + 7, y + 2, '#4a8ad0'); P(g, x + 7, y + 4, '#4a8ad0'); },
        (x, y) => { disc(g, x + 4, y + 3, 2, '#e5484d'); P(g, x + 5, y, '#4fb35a'); },
        (x, y) => { R(g, x + 1, y + 2, 7, 2, '#e5484d'); R(g, x + 2, y + 1, 4, 1, '#e5484d'); P(g, x + 2, y + 4, '#27242b'); P(g, x + 6, y + 4, '#27242b'); },
      ];
      for (let i = 0; i < 6; i++) {
        const x = 12 + i * 14;
        R(g, x, 9, 9, 7, '#fbf6ee'); R(g, x, 15, 9, 1, '#d9d2c6'); pics[i](x, 9);
        R(g, x + 3, 18, 3, 2, '#5e3b24');
        const c = pick(r, ['#e5484d', '#4a8ad0', '#ffd35a', '#4fb35a', '#c86ad8', '#ff9a6a', '#f28bb0']);
        if (i % 3 === 1) { R(g, x + 1, 20, 7, 9, c); R(g, x + 1, 20, 7, 3, shade(c, -0.2)); R(g, x + 3, 25, 3, 2, shade(c, 0.35)); }
        else {
          R(g, x + 1, 20, 7, 12, c); R(g, x, 21, 1, 8, shade(c, -0.2)); R(g, x + 8, 21, 1, 8, shade(c, -0.2));
          R(g, x + 4, 20, 1, 12, shade(c, -0.3)); R(g, x + 2, 20, 5, 1, shade(c, 0.3));
        }
        if (i % 2) { oval(g, x + 4, 3, 3, 2, pick(r, RAINBOW)); P(g, x + 4, 1, '#ffffff'); }
      }
      // pictures the children painted
      for (let i = 0; i < 2; i++) {
        const px = 258 + i * 13, py = 9 + i * 4;
        R(g, px, py, 11, 13, '#ffffff'); disc(g, px + 3, py + 3, 2, '#ffd35a');
        R(g, px + 1, py + 10, 9, 2, '#76a54a'); R(g, px + 5, py + 6, 4, 4, pick(r, RAINBOW)); poly(g, [[px + 4, py + 6], [px + 7, py + 3], [px + 10, py + 6]], '#e5484d');
      }
    },
  }, [
    benchObj(54, WALL + 12, 76, flurKid),
    obj(272, 56, makePlant(), { shadow: [5, 1], solid: { x: 266, y: WALL, w: 12, h: 12 }, interact: o => { Sound.pop(); burst(o.x, o.y - 18, 'leaf', 8); } }),
  ]);

  // the panda group
  const pandaArea = { x0: 20, y0: 64, x1: 220, y1: 150 };
  rooms.kitaPanda = buildRoom('kitaPanda', {
    w: 240, h: 176, seed: 43, floor: '#c8955a', wall: '#e6f2dc', pattern: 'bamboo', curtain: '#8fc46a',
    windows: [30, 186], rug: [150, 110, 36, 16, '#f7b6cf'],
    exit: { to: 'kitaFlur', at: { x: hallDoors.panda, y: WALL + 14, dir: 'down' } },
    decorate: g => poster(g, 108, 6, '#bfe6a8', drawPanda),
  }, [
    toyShelf(120, 54),
    crayonTable(62, 92),
    snackTable(84, 136),
    blockTower(152, 110),
    rockingHorse(32, 150),
    matObj(158, 162, '#8fc4ff'),
    matObj(188, 162, '#ffd35a'),
    matObj(218, 162, '#a8d88a', kidSprites(KID_LOOKS[5]).sleeper),
    kid(0, 54, 78, { dir: 'down', looks: ['down', 'down', 'right'] }),
    kid(1, 132, 106, { dir: 'right', looks: ['right', 'down', 'right'], play: true }),
    kid(3, 100, 120, { mode: 'wander', area: pandaArea }),
  ]);

  // upstairs: the landing in front of the badger group
  rooms.kitaOG = buildRoom('kitaOG', {
    w: 208, h: 128, seed: 44, floor: '#9ec2a8', floorKind: 'lino', surface: 'tile', wall: '#fbeccd', pattern: 'dots', curtain: '#e2a95c',
    windows: [150], exitLook: 'stairs',
    exit: { to: 'kitaFlur', at: { x: hallDoors.stairs, y: WALL + 14, dir: 'down' }, sound: 'stairs' },
    doors: [{ x: 104, to: 'kitaDachs', col: '#e2a95c', sign: badgerSign }],
  }, [
    obj(44, 50, makeBookshelf(), { solid: { x: 30, y: WALL, w: 28, h: 7 }, iy: 56, interact: o => { Sound.sparkle(); burst(o.x, o.y - 40, 'star', 5); } }),
    obj(188, 54, makePlant(), { shadow: [5, 1], solid: { x: 182, y: WALL, w: 12, h: 10 }, interact: o => { Sound.pop(); burst(o.x, o.y - 18, 'leaf', 8); } }),
  ]);

  // the badger group
  const dachsArea = { x0: 20, y0: 64, x1: 220, y1: 150 };
  rooms.kitaDachs = buildRoom('kitaDachs', {
    w: 240, h: 176, seed: 45, floor: '#b8865a', wall: '#f6e2c8', pattern: 'leaves', curtain: '#e2a95c',
    windows: [30, 186], rug: [150, 112, 38, 18, '#8fc4ff'],
    exit: { to: 'kitaOG', at: { x: 104, y: WALL + 14, dir: 'down' } },
    decorate: g => poster(g, 72, 6, '#f7d9a0', drawBadger),
  }, [
    playKitchen(124, 54),
    snackTable(64, 98),
    crayonTable(70, 140),
    ballObj(150, 112),
    matObj(158, 162, '#f28bb0', kidSprites(KID_LOOKS[6]).sleeper),
    matObj(188, 162, '#c9a0dc'),
    matObj(218, 162, '#8fc4ff'),
    kid(4, 132, 70, { dir: 'up', looks: ['up', 'up', 'left'] }),
    kid(7, 58, 84, { dir: 'down', looks: ['down', 'right'] }),
    kid(2, 170, 100, { mode: 'wander', area: dachsArea }),
  ]);

  rooms.kitaGarten = buildKitaGarden(kid);
  return rooms;
}

// ---- the garden behind the building -------------------------------------------------
function buildKitaGarden(kid) {
  const W = 352, H = 240, gx = W / 2 - 12;
  const box = { x0: 26, y0: 70, x1: 126, y1: 128 };
  const inBox = (x, y) => x > box.x0 + 3 && x < box.x1 - 3 && y > box.y0 + 3 && y < box.y1 - 1;
  const [c, g] = makeCanvas(W, H);
  const r = rng(47);
  paintLawn(g, W, H, r, 50, 70);
  R(g, 0, 0, W, 48, 'rgba(40,70,35,0.35)');
  // the sandpit in a wooden frame
  R(g, box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0 + 3, '#8a5a38');
  R(g, box.x0, box.y0, box.x1 - box.x0, 3, '#c8955a'); R(g, box.x0, box.y0, 3, box.y1 - box.y0, '#b98a5a'); R(g, box.x1 - 3, box.y0, 3, box.y1 - box.y0, '#a0703e');
  for (let y = box.y0 + 3; y < box.y1; y++) for (let x = box.x0 + 3; x < box.x1 - 3; x++) P(g, x, y, r() < 0.7 ? '#dcc48f' : pick(r, ['#c7ad78', '#ead6a8', '#b99d68', '#e3cc98']));
  R(g, box.x0, box.y1, box.x1 - box.x0, 3, '#6f4a2a'); R(g, box.x0, box.y1, box.x1 - box.x0, 1, '#a0703e');
  for (let i = 0; i < 30; i++) { const x = box.x0 + 8 + (r() * 84 | 0), y = box.y0 + 8 + (r() * 44 | 0); R(g, x, y, 2, 1, '#c7ad78'); P(g, x, y - 1, '#ead6a8'); }
  // a worn patch under the swings and the climbing frame
  oval(g, 252, 106, 36, 9, '#8f7552'); oval(g, 252, 105, 34, 7, '#a3875f');
  oval(g, 272, 196, 34, 10, '#8f7552'); oval(g, 272, 195, 32, 8, '#a3875f');
  // fences on both sides
  for (const x of [8, W - 12]) {
    R(g, x + 1, 44, 2, H - 54, '#bcae96');
    for (let y = 46; y < H - 12; y += 7) { R(g, x, y, 4, 5, '#ece4d3'); R(g, x, y + 4, 4, 1, '#bcae96'); }
  }
  // the back of the building along the bottom: the roof edge and the garden door
  for (let x = 0; x < W; x += 8) { R(g, x, H - 10, 8, 10, '#b25c44'); R(g, x, H - 10, 8, 1, '#d07a5a'); R(g, x, H - 6, 8, 1, '#8a4030'); R(g, x + 4, H - 5, 1, 5, '#8a4030'); }
  R(g, gx - 3, H - 11, 30, 11, '#2f5f96'); R(g, gx, H - 10, 24, 10, '#8d8781');
  R(g, gx + 2, H - 17, 20, 10, '#9a3a32'); R(g, gx + 3, H - 16, 18, 8, '#b8493e');
  for (let x = gx + 4; x < gx + 20; x += 3) R(g, x, H - 15, 1, 6, '#9a3a32');

  const sc = {
    id: 'kitaGarten', w: W, h: H, outdoor: true, objects: [], doors: [], ground: c,
    bounds: { x0: 14, y0: 50, x1: W - 14, y1: H + 4 },
    solids: [{ x: 0, y: H - 9, w: gx, h: 9 }, { x: gx + 24, y: H - 9, w: W - gx - 24, h: 9 }],
    surfaceAt: (x, y) => inBox(x, y) ? 'sand' : 'soft',
  };
  sc.doors.push({ x: gx, y: H - 6, w: 24, h: 12, need: 'down', to: 'kitaFlur', at: { x: 180, y: WALL + 14, dir: 'down' } });
  sc.entry = { x: W / 2, y: H - 20 };
  const add = o => { sc.objects.push(o); if (o.solid) sc.solids.push(o.solid); return o; };

  // the fence at the back, with trees and bushes behind it
  add(obj(8, 48, makeFence(W - 16), {}));
  for (let x = 16, i = 0; x < W; x += 34 + r() * 14, i++) {
    add(obj(x, 30 + r() * 10, i % 3 === 1 ? makePine(300 + i) : makeTree(310 + i, i % 4 === 2 ? 'lime' : 'green'), { tree: true }));
  }
  const bush = makeBush(5, '#f28bb0');
  for (const [x, y] of [[330, 62], [206, 58], [24, 196]]) add(obj(x, y, bush, { shadow: [10, 2], solid: { x: x - 9, y: y - 4, w: 18, h: 4 } }));
  add(obj(320, 156, makeTree(333, 'green'), { shadow: [14, 4], solid: { x: 316, y: 152, w: 8, h: 4 }, tree: true }));
  add(obj(86, 206, makeBench(), { shadow: [15, 2], solid: { x: 70, y: 200, w: 32, h: 6 } }));

  // the sandpit: build a castle one go at a time, then knock it down
  const castles = [0, 1, 2, 3, 4].map(makeCastle);
  add(obj(80, 108, castles[0], {
    shadow: [14, 2], stage: 0, top: 108 - 30,
    draw(ctx) { drawSprite(ctx, castles[this.stage], this.x, this.y); },
    interact(o) {
      if (o.stage === 4) { o.stage = 0; Sound.dig(); Sound.boing(); burst(o.x, o.y - 10, 'sand', 16); return; }
      o.stage++; Sound.dig(); burst(o.x, o.y - 8, 'sand', 8);
      if (o.stage === 4) { Sound.yay(); burst(o.x, o.y - 30, 'confetti', 16); burst(o.x, o.y - 30, 'star', 4); }
    },
  }));
  add(obj(46, 90, makeBucket(), { shadow: [6, 1], interact: o => { Sound.dig(); burst(o.x, o.y - 6, 'sand', 10); } }));
  add(kid(0, 106, 94, { dir: 'left', looks: ['left', 'down', 'left'], play: true }));

  // the water tap: water runs for a while and leaves a puddle to splash in
  add(obj(158, 84, makeTap(), {
    solid: { x: 152, y: 80, w: 14, h: 4 }, iy: 88, run: 0, pud: 0, tick: 0, splashT: 0,
    floor(ctx) {
      if (this.pud <= 0.02) return;
      const cx = this.x + 6, cy = this.y + 9, k = this.pud;
      oval(ctx, cx, cy, Math.round(4 + 16 * k), Math.round(2 + 5 * k), 'rgba(90,70,45,0.35)');
      oval(ctx, cx, cy, Math.round(3 + 14 * k), Math.round(1 + 4 * k), 'rgba(110,170,220,0.65)');
      if (k > 0.3) oval(ctx, cx - 3, cy - 1, Math.round(4 * k), 1, 'rgba(230,245,255,0.7)');
    },
    draw(ctx) {
      drawSprite(ctx, this.spr, this.x, this.y);
      if (this.run > 0) {
        const [sx, sy] = sprPx(this, 12, 12);
        ctx.fillStyle = 'rgba(160,210,250,0.85)'; ctx.fillRect(sx, sy, 2, this.y + 9 - sy);
        ctx.fillStyle = 'rgba(235,248,255,0.9)'; ctx.fillRect(sx, sy + ((G.t * 40) % 8 | 0), 1, 2);
      }
    },
    inPuddle(x, y) {
      const k = this.pud, dx = (x - this.x - 6) / (3 + 14 * k), dy = (y - this.y - 9) / (1.5 + 4 * k);
      return k > 0.1 && dx * dx + dy * dy <= 1;
    },
    update(dt) {
      if (this.run > 0) {
        this.run -= dt; this.tick -= dt;
        this.pud = Math.min(1, this.pud + dt * 0.3);
        if (this.tick <= 0) { this.tick = 0.13; Sound.water(); if (Math.random() < 0.5) burst(this.x + 6, this.y + 8, 'drop', 1); }
      } else this.pud = Math.max(0, this.pud - dt * 0.025);
      this.splashT -= dt;
      if (Pl.moving && this.splashT <= 0 && this.inPuddle(Pl.x, Pl.y)) {
        this.splashT = 0.28; Sound.splash(); burst(Pl.x, Pl.y - 2, 'drop', 5);
      }
    },
    interact: o => { if (o.run > 0) { o.run = 0; Sound.press(); } else { o.run = 5; Sound.press(); } },
  }));

  // swings (another child is already swinging) and the climbing frame
  addSwing(sc, add, 252, 104, kidSprites(KID_LOOKS[7]));
  const cx = 262, cy = 196;
  add(obj(cx, cy, makeClimbFrame(), {
    shadowFn: ctx => { ctx.fillStyle = 'rgba(34,22,38,0.2)'; ctx.fillRect(cx - 21, cy - 6, CLIMB.w + CLIMB.dx, 7); },
    solid: { x: cx - 22, y: cy - 8, w: CLIMB.w + CLIMB.dx + 2, h: 8 }, ix: cx, iy: cy + 2, top: cy - CLIMB.h + CLIMB.dy - 6,
    interact: o => startClimb(o),
  }));

  const area = { x0: 24, y0: 60, x1: W - 24, y1: H - 22 };
  add(kid(1, 200, 160, { mode: 'wander', area }));
  add(kid(3, 150, 190, { mode: 'wander', area }));
  return sc;
}
