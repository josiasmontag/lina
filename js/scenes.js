'use strict';
// ---------------------------------------------------------------------------
// Scenes: the outdoor street + park, and the house interiors.
// Object shape: { x, y, spr?, draw?(ctx,t), shadow?:[rx,ry], solid?:rect,
//                 interact?:fn, ix?, iy?, top? }
// ---------------------------------------------------------------------------

const NOTE = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, B5: 988, C6: 1047 };

function obj(x, y, spr, o = {}) { return Object.assign({ x, y, spr }, o); }

// --------------------------------------------------------------------------
// OUTDOOR
// --------------------------------------------------------------------------
const OUT = {
  W: 72 * 16, H: 46 * 16,
  base: 176, sw1: 208, road: 240, roadB: 304, sw2B: 336,
  cross: 544,
  gravel: { x: 340, y: 525, rx: 118, ry: 70 },
  swing: { x: 730, y: 478 },
  houses: [
    { id: 'home', cx: 256, w: 7, plaster: '#f0e2c6', beam: '#6b4430', roof: '#b25c44', door: '#d9738f', shutter: '#e48aa6', icon: 'heart', windows: [0.17, 0.83], dormer: true, seed: 11 },
    { id: 'bakery', cx: 544, w: 6, plaster: '#ecd6a8', beam: '#5a3a28', roof: '#6e7e8f', door: '#8a5532', shutter: null, icon: 'bread', windows: [0.17, 0.83], dormer: false, seed: 22 },
    { id: 'music', cx: 832, w: 6, plaster: '#dfe5d6', beam: '#4d3a2c', roof: '#5f7c46', door: '#4a7aa0', shutter: '#4a7aa0', icon: 'note', windows: [0.17, 0.83], dormer: true, seed: 33 },
  ],
};

function inGravel(x, y) {
  const q = OUT.gravel, dx = (x - q.x) / q.rx, dy = (y - q.y) / q.ry;
  return dx * dx + dy * dy <= 1;
}

function buildOutdoorGround(flowerSpots) {
  const { W, H } = OUT;
  const [c, g] = makeCanvas(W, H);
  const r = rng(1234);

  // grass
  R(g, 0, 0, W, H, '#6e9444');
  for (let i = 0; i < 320; i++) disc(g, r() * W, r() * H, 8 + r() * 26, r() < 0.5 ? 'rgba(70,100,45,0.16)' : 'rgba(150,175,85,0.13)');
  for (let i = 0; i < W * H / 12; i++) {
    const x = r() * W | 0, y = r() * H | 0, k = r();
    g.fillStyle = k < 0.45 ? '#5a7d37' : k < 0.82 ? '#83a94f' : '#9dbd5f';
    g.fillRect(x, y, 1, k < 0.45 ? 2 : 1);
  }
  // tiny flowers in the lawn
  for (let i = 0; i < 420; i++) {
    const x = r() * W | 0, y = r() * H | 0;
    const col = pick(r, ['#ffffff', '#fff1a8', '#f7b6cf', '#bcd8ff']);
    P(g, x - 1, y, col); P(g, x + 1, y, col); P(g, x, y - 1, col); P(g, x, y + 1, col); P(g, x, y, '#ffd24a');
  }

  // flower beds along house fronts + stone paths to doors
  for (const h of OUT.houses) {
    const hw = h.w * 16 / 2;
    for (const [x0, x1] of [[h.cx - hw, h.cx - 12], [h.cx + 12, h.cx + hw]]) {
      R(g, x0, OUT.base, x1 - x0, 6, '#5a3e2a'); R(g, x0, OUT.base + 5, x1 - x0, 1, '#4a3222');
      for (let x = x0 + 1; x < x1 - 1; x += 2) {
        P(g, x, OUT.base + 3, '#3c6934'); P(g, x + 1, OUT.base + 2, '#55873d');
        if (r() < 0.6) P(g, x, OUT.base + 1 + (r() * 2 | 0), pick(r, ['#e5484d', '#f28bb0', '#ffd35a', '#ffffff', '#c86ad8']));
      }
    }
    R(g, h.cx - 10, OUT.base, 20, OUT.sw1 - OUT.base, '#8a7a5f');
    for (let y = OUT.base + 1; y < OUT.sw1; y += 8) {
      for (const [ox, w] of [[-9, 9], [1, 8]]) {
        const yy = y + (ox > 0 ? 3 : 0);
        R(g, h.cx + ox, yy, w, 6, '#bcae93'); R(g, h.cx + ox, yy + 5, w, 1, '#8f8068'); R(g, h.cx + ox, yy, w, 1, '#d4c7ad');
      }
    }
  }

  // sidewalks (square pavers)
  const pave = (y0, y1) => {
    R(g, 0, y0, W, y1 - y0, '#bdb19c');
    for (let y = y0; y < y1; y += 8) for (let x = 0; x < W; x += 8) {
      if (r() < 0.35) R(g, x + 1, y + 1, 7, 7, r() < 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(60,40,20,0.06)');
      R(g, x, y, 8, 1, '#a39781'); R(g, x, y, 1, 8, '#a39781');
      if (r() < 0.015) { P(g, x, y + 3, '#6e9444'); P(g, x + 1, y + 2, '#83a94f'); }
    }
  };
  pave(OUT.sw1, OUT.road); pave(OUT.roadB, OUT.sw2B);

  // cobblestone road
  R(g, 0, OUT.road, W, OUT.roadB - OUT.road, '#4d494e');
  const stones = ['#8d8a8c', '#9a9698', '#7f7c80', '#a5a1a0', '#8a8480', '#96918a'];
  for (let y = OUT.road, row = 0; y < OUT.roadB; y += 5, row++) {
    for (let x = -(row % 2) * 3; x < W; x += 6) {
      const col = pick(r, stones);
      R(g, x, y, 5, 4, col); R(g, x, y, 5, 1, shade(col, 0.15)); R(g, x, y + 3, 5, 1, shade(col, -0.18));
    }
  }
  // zebra crossing
  for (let y = OUT.road + 3; y < OUT.roadB - 3; y += 9) {
    R(g, OUT.cross - 24, y, 48, 5, 'rgba(240,236,224,0.88)');
    for (let i = 0; i < 12; i++) P(g, OUT.cross - 24 + (r() * 48 | 0), y + (r() * 5 | 0), 'rgba(90,85,90,0.6)');
  }
  // curbs
  R(g, 0, OUT.road - 2, W, 2, '#d8d1c4'); R(g, 0, OUT.road, W, 1, '#2f2b30');
  R(g, 0, OUT.roadB, W, 2, '#d8d1c4'); R(g, 0, OUT.roadB - 1, W, 1, '#2f2b30');

  // grass tufts overhanging sidewalk edges
  for (const y of [OUT.sw1, OUT.sw2B - 1]) for (let x = 0; x < W; x++) {
    if (r() < 0.45) P(g, x, y, r() < 0.5 ? '#5a7d37' : '#83a94f');
    if (r() < 0.15) P(g, x, y + (y === OUT.sw1 ? 1 : -1), '#5a7d37');
  }

  // dirt paths through the park
  const path = [[OUT.cross, OUT.sw2B + 14], [OUT.cross, 440], [470, 470], [430, 488]];
  const path2 = [[OUT.cross, 440], [640, 468], [OUT.swing.x - 30, OUT.swing.y + 4]];
  const segs = [];
  for (const pts of [path, path2]) for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.hypot(x1 - x0, y1 - y0) / 2;
    for (let k = 0; k <= n; k++) segs.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);
  }
  R(g, OUT.cross - 14, OUT.sw2B, 29, 16, '#8f7552'); R(g, OUT.cross - 12, OUT.sw2B, 25, 16, '#a3875f');
  for (const [x, y] of segs) disc(g, x, y, 14, '#8f7552');
  for (const [x, y] of segs) disc(g, x, y, 12, '#a3875f');
  for (const [x, y] of segs) for (let k = 0; k < 3; k++) {
    const a = r() * Math.PI * 2, d = r() * 11;
    P(g, Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), pick(r, ['#8f7552', '#b89b70', '#7d6446', '#c4ab82']));
  }
  R(g, OUT.cross - 14, OUT.sw2B, 29, 2, '#d8d1c4');

  // gravel playground with a concrete rim (like the real one!)
  const q = OUT.gravel;
  const gcols = ['#c9cfd6', '#a9b1bb', '#e3e6ea', '#7a828d', '#b7aea2', '#d8d4cc', '#959da8'];
  for (let y = q.y - q.ry - 5; y <= q.y + q.ry + 5; y++) for (let x = q.x - q.rx - 5; x <= q.x + q.rx + 5; x++) {
    const dx = (x - q.x) / q.rx, dy = (y - q.y) / q.ry, e = Math.sqrt(dx * dx + dy * dy);
    if (e <= 1) P(g, x, y, r() < 0.75 ? pick(r, gcols) : '#6f7680');
    else if (e <= 1.045) P(g, x, y, y > q.y ? '#c4bfb6' : '#d9d4cb');
    else if (e <= 1.06 && y > q.y) P(g, x, y, '#8b867e');
  }
  for (let i = 0; i < 900; i++) { // a few bigger pebbles
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.95;
    const x = Math.round(q.x + Math.cos(a) * d * q.rx), y = Math.round(q.y + Math.sin(a) * d * q.ry);
    R(g, x, y, 2, 1, pick(r, gcols)); P(g, x, y + 1, '#5f6670');
  }

  // sand under the swing
  const s = OUT.swing;
  oval(g, s.x, s.y - 4, 42, 18, '#c7ad78'); oval(g, s.x, s.y - 5, 40, 16, '#dcc48f');
  for (let i = 0; i < 400; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.95;
    P(g, Math.round(s.x + Math.cos(a) * d * 40), Math.round(s.y - 5 + Math.sin(a) * d * 16), pick(r, ['#c7ad78', '#ead6a8', '#b99d68']));
  }

  // flower patches in the park (butterflies like these)
  for (let i = 0; i < 18; i++) {
    const x = 60 + r() * (W - 120), y = OUT.sw2B + 30 + r() * (H - OUT.sw2B - 80);
    if (inGravel(x, y) || Math.hypot(x - s.x, y - s.y) < 70 || Math.abs(x - OUT.cross) < 30) continue;
    flowerSpots.push([x, y]);
    const col = pick(r, ['#e5484d', '#f28bb0', '#ffd35a', '#ffffff', '#c86ad8', '#7ab8ff']);
    for (let k = 0; k < 26; k++) {
      const fx = Math.round(x + (r() - 0.5) * 26), fy = Math.round(y + (r() - 0.5) * 12);
      P(g, fx, fy + 1, '#3c6934'); P(g, fx, fy, col); if (r() < 0.4) P(g, fx + 1, fy, col);
    }
  }
  return c;
}

function buildOutdoor() {
  const { W, H } = OUT;
  const flowerSpots = [];
  const sc = {
    id: 'out', w: W, h: H, outdoor: true, objects: [], solids: [], doors: [],
    bounds: { x0: 28, y0: 118, x1: W - 28, y1: H - 30 },
    ground: buildOutdoorGround(flowerSpots), flowerSpots,
  };
  const r = rng(4242);
  const add = o => { sc.objects.push(o); if (o.solid) sc.solids.push(o.solid); return o; };
  const reserved = [];
  const isFree = (x, y, rad) => reserved.every(([rx, ry, rr]) => Math.hypot(x - rx, y - ry) > rad + rr);

  // houses
  for (const h of OUT.houses) {
    const s = makeHouse(h), hw = s.W / 2;
    add(obj(h.cx, OUT.base, s, {
      solid: { x: h.cx - hw, y: OUT.base - 44, w: s.W, h: 44 },
      shadowFn: ctx => { ctx.fillStyle = 'rgba(34,22,38,0.22)'; ctx.fillRect(h.cx - hw + 2, OUT.base - 1, s.W + 4, 4); },
    }));
    const dx = h.cx + s.doorX;
    sc.doors.push({ x: dx - 8, y: OUT.base - 3, w: 16, h: 9, to: h.id, need: 'up', spawn: { x: dx, y: OUT.base + 12 } });
    h.doorWorldX = dx;
    for (const [x0, x1] of [[h.cx - hw - 6, h.cx - 12], [h.cx + 13, h.cx + hw + 6]]) {
      const len = x1 - x0;
      add(obj(x0, OUT.sw1 - 2, makeFence(len), { solid: { x: x0, y: OUT.sw1 - 6, w: len, h: 4 } }));
    }
    reserved.push([h.cx, OUT.base - 20, hw + 20]);
  }

  // mailbox by Lina's home
  const home = OUT.houses[0];
  add(obj(home.cx + 24, 200, makeMailbox(), {
    shadow: [4, 1], solid: { x: home.cx + 21, y: 197, w: 6, h: 3 },
    interact: o => { Sound.pop(); burst(o.x, o.y - 20, 'heart', 3); },
  }));

  // lamps
  const lamp = makeLamp();
  for (const x of [150, 400, 690, 980]) add(obj(x, OUT.sw1 + 6, lamp, { shadow: [4, 1], solid: { x: x - 2, y: OUT.sw1 + 3, w: 4, h: 3 }, glow: { dy: -38, r: 30 } }));
  for (const x of [120, 330, 760, 1000]) add(obj(x, OUT.sw2B - 2, lamp, { shadow: [4, 1], solid: { x: x - 2, y: OUT.sw2B - 5, w: 4, h: 3 }, glow: { dy: -38, r: 30 } }));
  add(obj(OUT.cross + 26, 424, lamp, { shadow: [4, 1], solid: { x: OUT.cross + 24, y: 421, w: 4, h: 3 }, glow: { dy: -38, r: 30 } }));

  // tree sprite variants
  const oaks = [], pines = [];
  for (let i = 0; i < 8; i++) oaks.push(makeTree(100 + i, i === 3 || i === 6 ? 'autumn' : i % 3 === 0 ? 'lime' : 'green'));
  for (let i = 0; i < 3; i++) pines.push(makePine(200 + i));
  const tree = (x, y, pine) => {
    const s = pine ? pick(r, pines) : pick(r, oaks);
    reserved.push([x, y, 14]);
    return add(obj(x, y, s, { shadow: pine ? [9, 3] : [14, 4], solid: { x: x - 4, y: y - 4, w: 8, h: 4 }, tree: true }));
  };

  // forest behind the houses
  for (let x = 6; x < W; x += 22 + r() * 10) tree(x, 60 + r() * 20, r() < 0.4);
  for (let x = 20; x < W; x += 30 + r() * 16) tree(x, 100 + r() * 14, r() < 0.3);
  // side and bottom borders
  for (let y = 130; y < OUT.sw1; y += 26) { tree(12 + r() * 8, y, true); tree(W - 12 - r() * 8, y, true); }
  for (let y = OUT.sw2B + 30; y < H - 20; y += 26 + r() * 8) { tree(10 + r() * 10, y, r() < 0.5); tree(W - 10 - r() * 10, y, r() < 0.5); }
  for (let x = 30; x < W - 20; x += 24 + r() * 10) tree(x, H - 6 - r() * 10, r() < 0.4);
  // garden trees & bushes between houses
  tree(400, 160); tree(690, 158); tree(980, 162); tree(110, 165);
  const bushes = [makeBush(1, '#f28bb0'), makeBush(2, null), makeBush(3, '#ffffff'), makeBush(4, '#ffd35a')];
  for (const [x, y] of [[350, 190], [450, 194], [640, 188], [735, 192], [930, 190], [1030, 194], [70, 190]]) {
    add(obj(x, y, pick(r, bushes), { shadow: [10, 2], solid: { x: x - 9, y: y - 4, w: 18, h: 4 } }));
  }

  // playground
  const q = OUT.gravel;
  reserved.push([q.x, q.y, q.rx + 10]);
  add(obj(q.x - 40, q.y - 8, makeClimbRock(), { shadow: [22, 5], solid: { x: q.x - 62, y: q.y - 20, w: 44, h: 12 } }));
  add(obj(q.x + 50, q.y - 30, makePosts(), { shadow: [16, 3], solid: { x: q.x + 34, y: q.y - 34, w: 32, h: 4 } }));
  const bench = makeBench();
  add(obj(q.x + 20, q.y + q.ry + 24, bench, { shadow: [15, 2], solid: { x: q.x + 4, y: q.y + q.ry + 18, w: 32, h: 6 } }));
  add(obj(OUT.cross + 60, 400, bench, { shadow: [15, 2], solid: { x: OUT.cross + 44, y: 394, w: 32, h: 6 } }));
  reserved.push([OUT.cross + 60, 396, 24]);

  // swing
  const sw = OUT.swing;
  reserved.push([sw.x, sw.y, 60]);
  const swingFrame = makeSwingFrame();
  const swingObj = add(obj(sw.x, sw.y, swingFrame, {
    solid: null, ix: sw.x - 11, iy: sw.y + 2, top: sw.y - 44, seatX: sw.x - 11, phase: 0, amp: 0, rider: false,
    shadowFn: ctx => { drawShadow(ctx, sw.x - 22, sw.y, 4, 1); drawShadow(ctx, sw.x + 22, sw.y, 4, 1); drawShadow(ctx, sw.x - 11, sw.y + 2, 5, 2); drawShadow(ctx, sw.x + 11, sw.y + 2, 5, 2); },
    draw(ctx) {
      drawSprite(ctx, this.spr, this.x, this.y);
      for (const [sx, moving] of [[this.x - 11, true], [this.x + 11, false]]) {
        const a = moving ? Math.sin(this.phase) * this.amp : Math.sin(G.t * 1.3) * 0.05;
        const seatY = this.y - 13 + Math.sin(a) * 6, lift = Math.abs(Math.sin(a)) * 4;
        const sy = Math.round(seatY - lift);
        ctx.fillStyle = '#6d6a70';
        ctx.fillRect(sx - 4, this.y - 38, 1, sy - (this.y - 38));
        ctx.fillRect(sx + 4, this.y - 38, 1, sy - (this.y - 38));
        if (moving && this.rider) {
          drawSprite(ctx, SPR.linaSit, sx, sy + 1);
          ctx.fillStyle = '#2a1c18'; ctx.fillRect(sx - 6, sy, 12, 3);
          ctx.fillStyle = '#e2336f'; ctx.fillRect(sx - 5, sy, 10, 2);
          ctx.fillStyle = LC.skin; ctx.fillRect(sx - 7, sy - 8, 2, 2); ctx.fillRect(sx + 5, sy - 8, 2, 2);
        } else {
          ctx.fillStyle = '#2a1c18'; ctx.fillRect(sx - 6, sy - 1, 12, 4);
          ctx.fillStyle = moving ? '#e2336f' : '#4a8ad0'; ctx.fillRect(sx - 5, sy, 10, 2);
        }
      }
    },
    interact: o => startSwing(o),
  }));
  sc.solids.push({ x: sw.x - 28, y: sw.y - 3, w: 8, h: 3 }, { x: sw.x + 20, y: sw.y - 3, w: 8, h: 3 });
  sc.swing = swingObj;

  // trees in the park
  reserved.push([OUT.cross, 380, 30], [OUT.cross, 440, 30], [620, 460, 30], [480, 470, 30]);
  let tries = 0, placed = 0;
  while (placed < 20 && tries++ < 400) {
    const x = 60 + r() * (W - 120), y = OUT.sw2B + 50 + r() * (H - OUT.sw2B - 100);
    if (!isFree(x, y, 26)) continue;
    tree(x, y, r() < 0.15); placed++;
  }
  for (let i = 0; i < 8; i++) {
    const x = 60 + r() * (W - 120), y = OUT.sw2B + 40 + r() * (H - OUT.sw2B - 90);
    if (!isFree(x, y, 16)) continue;
    reserved.push([x, y, 12]);
    add(obj(x, y, pick(r, bushes), { shadow: [10, 2], solid: { x: x - 9, y: y - 4, w: 18, h: 4 } }));
  }
  return sc;
}

// --------------------------------------------------------------------------
// INTERIORS
// --------------------------------------------------------------------------
const WALL = 44;

function buildRoomGround(o) {
  const w = o.w, h = o.h;
  const [c, g] = makeCanvas(w, h);
  const r = rng(o.seed);
  // wooden floor
  R(g, 0, 0, w, h, o.floor);
  const fd = shade(o.floor, -0.25);
  for (let y = WALL; y < h; y += 5) {
    R(g, 0, y, w, 1, fd);
    let x = -(r() * 30 | 0);
    while (x < w) {
      const L = 18 + (r() * 24 | 0);
      R(g, x, y, 1, 5, fd);
      R(g, x + 1, y + 1, L - 1, 4, r() < 0.5 ? 'rgba(255,240,210,0.06)' : 'rgba(60,30,10,0.07)');
      if (r() < 0.2) P(g, x + (r() * L | 0), y + 2, fd);
      x += L;
    }
  }
  if (o.rug) {
    const [rx, ry, a, b, cc] = o.rug;
    oval(g, rx, ry, a + 2, b + 2, shade(cc, -0.3)); oval(g, rx, ry, a, b, cc);
    oval(g, rx, ry, a - 5, b - 3, shade(cc, 0.3)); oval(g, rx, ry, a - 8, b - 5, cc);
  }
  // wall
  R(g, 0, 0, w, WALL, o.wall);
  const wd = shade(o.wall, -0.12);
  if (o.pattern === 'stripes') for (let x = 0; x < w; x += 8) R(g, x, 0, 3, WALL, wd);
  if (o.pattern === 'dots') for (let y = 8; y < WALL - 14; y += 6) for (let x = (y / 6 % 2) * 4; x < w; x += 8) P(g, x, y, wd);
  if (o.pattern === 'notes') for (let y = 8; y < WALL - 18; y += 12) for (let x = (y / 12 % 2) * 10; x < w; x += 20) bitmap(g, BMP.note, x, y, wd);
  R(g, 0, WALL - 14, w, 14, '#9a6a40'); for (let x = 0; x < w; x += 8) R(g, x, WALL - 13, 1, 11, '#7a4e30');
  R(g, 0, WALL - 15, w, 2, '#b98a5a'); R(g, 0, WALL - 2, w, 2, '#5e3b24');
  R(g, 0, 0, w, 5, '#2c1e19'); R(g, 0, 5, w, 1, '#4a3228');
  for (const wx of o.windows || []) {
    R(g, wx, 9, 24, 20, '#7a4e30');
    R(g, wx + 2, 11, 20, 16, '#9fd3f0'); R(g, wx + 2, 11, 20, 6, '#cfeaf8');
    R(g, wx + 11, 11, 2, 16, '#7a4e30'); R(g, wx + 2, 18, 20, 1, '#7a4e30');
    P(g, wx + 4, 13, '#ffffff'); P(g, wx + 5, 13, '#ffffff'); P(g, wx + 4, 14, '#ffffff');
    R(g, wx - 1, 28, 26, 2, '#b98a5a');
    R(g, wx - 4, 8, 5, 20, o.curtain); R(g, wx + 23, 8, 5, 20, o.curtain);
    R(g, wx - 5, 7, 34, 2, '#5e3b24');
  }
  for (const [px, py, kind] of o.pictures || []) {
    R(g, px, py, 14, 12, '#c49a62'); R(g, px + 1, py + 1, 12, 10, '#fbf6ea');
    if (kind === 'sun') { disc(g, px + 5, py + 5, 2, '#ffd24a'); R(g, px + 1, py + 9, 12, 2, '#76a54a'); P(g, px + 9, py + 7, '#e5484d'); P(g, px + 10, py + 6, '#4fb35a'); }
    if (kind === 'pretzel') iconOnSign(g, 'bread', px + 3, py + 3);
    if (kind === 'heart') bitmap(g, BMP.heart, px + 3, py + 3, '#e8507e');
  }
  R(g, 0, WALL, w, 3, 'rgba(40,25,20,0.28)');
  // side walls
  R(g, 0, 0, 7, h, '#3a2a22'); R(g, w - 7, 0, 7, h, '#3a2a22');
  R(g, 6, WALL, 1, h - WALL, '#56402f'); R(g, w - 7, WALL, 1, h - WALL, '#56402f');
  // front wall with the door gap
  const gx = w / 2 - 12;
  R(g, 0, h - 8, gx, 8, '#3a2a22'); R(g, gx + 24, h - 8, w - gx - 24, 8, '#3a2a22');
  R(g, 0, h - 8, gx, 1, '#56402f'); R(g, gx + 24, h - 8, w - gx - 24, 1, '#56402f');
  R(g, gx, h - 8, 24, 8, shade(o.floor, -0.35));
  R(g, gx + 2, h - 17, 20, 10, '#9a3a32'); R(g, gx + 3, h - 16, 18, 8, '#b8493e');
  for (let x = gx + 4; x < gx + 20; x += 3) R(g, x, h - 15, 1, 6, '#9a3a32');
  return c;
}

function buildRoom(id, o, items) {
  const w = o.w, h = o.h, gx = w / 2 - 12;
  const sc = {
    id, w, h, outdoor: false, objects: [], doors: [], windows: o.windows || [],
    bounds: { x0: 0, y0: 0, x1: w, y1: h + 4 },
    ground: buildRoomGround(o),
    solids: [
      { x: 0, y: 0, w, h: WALL + 4 }, { x: 0, y: 0, w: 8, h }, { x: w - 8, y: 0, w: 8, h },
      { x: 0, y: h - 7, w: gx, h: 7 }, { x: gx + 24, y: h - 7, w: w - gx - 24, h: 7 },
    ],
    glows: o.glows || [],
  };
  const house = OUT.houses.find(hh => hh.id === id);
  sc.doors.push({ x: gx, y: h - 6, w: 24, h: 12, to: 'out', need: 'down', spawn: { x: house.doorWorldX, y: OUT.base + 12 } });
  sc.entry = { x: w / 2, y: h - 18 };
  for (const it of items) { sc.objects.push(it); if (it.solid) sc.solids.push(it.solid); }
  return sc;
}

function buildInteriors() {
  const rooms = {};
  const W = 208, H = 160;

  // Lina's home
  let pianoIdx = 0;
  rooms.home = buildRoom('home', {
    w: W, h: H, seed: 1, floor: '#a8764a', wall: '#f0c9c9', pattern: 'dots', curtain: '#f28bb0',
    windows: [40, 132], pictures: [[172, 14, 'sun'], [16, 16, 'heart']], rug: [108, 112, 34, 16, '#f2a3bd'],
  }, [
    obj(34, 88, makeBed(), {
      shadow: [14, 3], solid: { x: 20, y: WALL, w: 28, h: 44 }, ix: 34, iy: 92,
      interact: o => startSleep(o),
      draw(ctx) { drawSprite(ctx, this.spr, this.x, this.y); if (Pl.sleep && Pl.sleep.bed === this) drawSleeper(this); },
    }),
    obj(100, 50, makeBookshelf(), { solid: { x: 86, y: WALL, w: 28, h: 7 }, iy: 56, interact: o => { Sound.sparkle(); burst(o.x, o.y - 40, 'star', 5); } }),
    obj(182, 52, makePlant(), { shadow: [5, 1], solid: { x: 176, y: WALL, w: 12, h: 8 }, interact: o => { Sound.pop(); burst(o.x, o.y - 18, 'leaf', 8); } }),
    obj(162, 100, makeToyBox(), { shadow: [11, 2], solid: { x: 151, y: 90, w: 22, h: 10 }, interact: o => { Sound.pop(); Sound.sparkle(); burst(o.x, o.y - 18, 'star', 6); burst(o.x, o.y - 14, 'confetti', 14); } }),
    obj(74, 50, makeMirror(), {
      shadow: [6, 1], solid: { x: 67, y: WALL, w: 14, h: 6 }, iy: 56,
      interact: o => {
        const i = HAIR_STYLES.indexOf(SPR.hairStyle);
        setLinaStyle(HAIR_STYLES[(i + 1) % HAIR_STYLES.length]);
        Sound.sparkle(); burst(o.x, o.y - 30, 'star', 6);
        burst(Pl.x, Pl.y - 26, 'heart', 2);
      },
    }),
    obj(58, 84, makeTeddy(), { shadow: [5, 1], interact: o => { Sound.squeak(); burst(o.x, o.y - 14, 'heart', 5); o.hop = 0.4; } }),
  ]);

  // bakery
  rooms.bakery = buildRoom('bakery', {
    w: W, h: H, seed: 2, floor: '#9a6a40', wall: '#eed9a6', pattern: 'stripes', curtain: '#e2a95c',
    windows: [92], pictures: [[128, 14, 'pretzel']], rug: null,
    glows: [{ x: 172, y: 36, r: 40, col: '255,140,60', flicker: true }],
  }, [
    obj(48, 50, makeBreadShelf(), { solid: { x: 26, y: WALL, w: 44, h: 7 }, iy: 56, interact: o => { Sound.yum(); burst(o.x, o.y - 20, 'heart', 3); burst(o.x, o.y - 20, 'crumb', 10); } }),
    obj(172, 54, makeOven(), { solid: { x: 155, y: WALL, w: 34, h: 11 }, iy: 60, interact: o => { Sound.crackle(); burst(o.x, o.y - 18, 'spark', 14); } }),
    obj(104, 104, makeCounter(), { shadow: [30, 3], solid: { x: 72, y: 88, w: 64, h: 16 }, iy: 108, interact: o => { Sound.ding(); burst(o.x, o.y - 26, 'star', 4); } }),
    obj(40, 128, makeCakeTable(), {
      shadow: [11, 2], solid: { x: 29, y: 120, w: 22, h: 8 }, iy: 132,
      interact: o => { Sound.melody([NOTE.G4, NOTE.G4, NOTE.A4, NOTE.G4, NOTE.C5, NOTE.B4, 0, NOTE.G4, NOTE.G4, NOTE.A4, NOTE.G4, NOTE.D5, NOTE.C5], 0.26); burst(o.x, o.y - 26, 'confetti', 30); burst(o.x, o.y - 26, 'heart', 3); },
    }),
  ]);

  // music house
  const twinkle = [NOTE.C5, NOTE.C5, NOTE.G5, NOTE.G5, NOTE.A5, NOTE.A5, NOTE.G5, NOTE.F5, NOTE.F5, NOTE.E5, NOTE.E5, NOTE.D5, NOTE.D5, NOTE.C5];
  rooms.music = buildRoom('music', {
    w: W, h: H, seed: 3, floor: '#8a6444', wall: '#bcd6e0', pattern: 'notes', curtain: '#4a7aa0',
    windows: [108], pictures: [[20, 14, 'sun']], rug: [110, 116, 40, 18, '#7a9ad0'],
  }, [
    obj(62, 54, makePiano(), { solid: { x: 42, y: WALL, w: 40, h: 11 }, iy: 60, interact: o => { Sound.note(twinkle[pianoIdx % twinkle.length]); pianoIdx++; burst(o.x + (Math.random() - 0.5) * 20, o.y - 26, 'note', 1); } }),
    obj(162, 44, makeGuitar(), { iy: 54, interact: o => { [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => setTimeout(() => Sound.note(f), i * 60)); burst(o.x, o.y - 20, 'note', 3); } }),
    obj(152, 116, makeDrum(), { shadow: [8, 2], solid: { x: 144, y: 110, w: 16, h: 6 }, interact: o => { Sound.drum(); burst(o.x, o.y - 14, 'star', 4); G.shake = 0.25; } }),
    obj(70, 118, makeXylo(), { shadow: [14, 2], solid: { x: 56, y: 110, w: 28, h: 8 }, interact: o => { Sound.xylo(); burst(o.x, o.y - 10, 'note', 6); } }),
  ]);
  return rooms;
}
