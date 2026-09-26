'use strict';
// ---------------------------------------------------------------------------
// World props: half-timbered houses, trees, lamps, benches, playground,
// and interior furniture. All procedurally drawn pixel art.
// ---------------------------------------------------------------------------

function iconOnSign(g, kind, x, y) {
  if (kind === 'heart') { bitmap(g, BMP.heart, x, y + 1, '#e8507e'); P(g, x + 1, y + 2, '#ffb3c9'); }
  if (kind === 'bread') {
    oval(g, x + 3, y + 4, 4, 2, '#c6863f'); oval(g, x + 3, y + 3, 3, 1, '#e2a95c');
    P(g, x + 1, y + 3, '#8a5320'); P(g, x + 3, y + 3, '#8a5320'); P(g, x + 5, y + 3, '#8a5320');
  }
  if (kind === 'note') bitmap(g, BMP.note, x + 1, y, '#3b5f8a');
}

function makeHouse(o) {
  const W = o.w * 16, OV = 5, CW = W + OV * 2, wallTop = 58, wallBot = 104, CH = 106, roofTop = 14;
  const doorCX = OV + Math.round(W / 2);
  const s = sprite(CW, CH, CW / 2, wallBot, g => {
    const r = rng(o.seed);
    const rb = o.roof, rl = shade(rb, 0.18), rd = shade(rb, -0.28), rdd = shade(rb, -0.5);
    const bm = o.beam;
    // chimney
    const chx = OV + Math.round(W * 0.72);
    R(g, chx, 3, 10, 22, '#8c5b47');
    for (let y = 5; y < 25; y += 3) { R(g, chx, y, 10, 1, '#6a4133'); P(g, chx + ((y / 3 | 0) % 2 ? 3 : 7), y - 1, '#6a4133'); }
    R(g, chx - 1, 1, 12, 3, '#5d585b'); R(g, chx - 1, 1, 12, 1, '#7c7679');
    // roof tiles
    for (let y = roofTop, row = 0; y < wallTop; y += 5, row++) {
      R(g, 0, y, CW, 5, rb); R(g, 0, y, CW, 1, rl); R(g, 0, y + 4, CW, 1, rd);
      for (let x = (row % 2) * 4; x < CW; x += 8) R(g, x, y + 1, 1, 3, rd);
      for (let i = 0; i < CW / 9; i++) {
        const x = (r() * CW) | 0;
        R(g, x, y + 1, 3, 2, r() < 0.5 ? shade(rb, 0.08) : shade(rb, -0.1));
      }
      if (r() < 0.6) { const x = (r() * CW) | 0; R(g, x, y + 2, 2, 1, '#7c8a4a'); } // a little moss
    }
    R(g, 0, roofTop - 4, CW, 5, rd); R(g, 0, roofTop - 4, CW, 1, rl);
    for (let x = 2; x < CW; x += 6) P(g, x, roofTop - 2, rdd);
    R(g, 0, roofTop - 4, 2, wallTop - roofTop + 4, rl); R(g, CW - 2, roofTop - 4, 2, wallTop - roofTop + 4, rdd);
    R(g, 0, wallTop - 2, CW, 2, rdd);
    // dormer window
    if (o.dormer) {
      const dx = OV + Math.round(W * 0.28) - 8, dy = roofTop + 10;
      R(g, dx, dy + 5, 16, 15, o.plaster);
      poly(g, [[dx - 3, dy + 7], [dx + 8, dy - 3], [dx + 19, dy + 7]], rd);
      poly(g, [[dx - 1, dy + 6], [dx + 8, dy - 1], [dx + 17, dy + 6]], rb);
      R(g, dx + 4, dy + 9, 8, 9, bm); R(g, dx + 5, dy + 10, 6, 7, '#f3d27a'); R(g, dx + 5, dy + 10, 6, 2, '#f8e4a8');
      R(g, dx + 7, dy + 10, 1, 7, bm); R(g, dx + 5, dy + 13, 6, 1, bm);
    }
    // plaster wall
    const pl = o.plaster;
    R(g, OV, wallTop, W, wallBot - wallTop, pl);
    for (let i = 0; i < W * 2; i++) P(g, OV + (r() * W | 0), wallTop + (r() * (wallBot - wallTop) | 0), r() < 0.5 ? shade(pl, -0.08) : shade(pl, 0.1));
    R(g, OV, wallTop, W, 5, 'rgba(50,25,20,0.28)');
    // half-timbering
    R(g, OV, wallTop, W, 3, bm); R(g, OV, wallTop + 22, W, 3, bm);
    R(g, OV, wallTop, 3, wallBot - wallTop, bm); R(g, OV + W - 3, wallTop, 3, wallBot - wallTop, bm);
    for (const fx of [0.25, 0.75]) R(g, OV + Math.round(W * fx) - 1, wallTop, 3, 23, bm);
    line(g, OV + 3, wallTop + 21, OV + Math.round(W * 0.25) - 2, wallTop + 4, bm, 2);
    line(g, OV + W - 4, wallTop + 21, OV + Math.round(W * 0.75) + 3, wallTop + 4, bm, 2);
    // small upper windows
    for (const fx of [0.42, 0.58]) {
      const x = OV + Math.round(W * fx) - 4, y = wallTop + 7;
      R(g, x, y, 9, 10, bm); R(g, x + 1, y + 1, 7, 8, '#f3d27a'); R(g, x + 1, y + 1, 7, 2, '#f8e4a8'); R(g, x + 4, y + 1, 1, 8, bm);
    }
    // stone foundation
    R(g, OV, wallBot - 8, W, 8, '#8d8781'); R(g, OV, wallBot - 8, W, 1, '#aaa49d'); R(g, OV, wallBot - 4, W, 1, '#6c6661');
    for (let y = wallBot - 8; y < wallBot; y += 4) for (let x = OV + ((y / 4 | 0) % 2) * 5; x < OV + W; x += 10) R(g, x, y, 1, 4, '#6c6661');
    // big windows with flower boxes
    for (const fx of o.windows) {
      const x = OV + Math.round(W * fx) - 7, y = wallTop + 27;
      if (o.shutter) {
        R(g, x - 5, y, 5, 12, o.shutter); R(g, x + 14, y, 5, 12, o.shutter);
        R(g, x - 4, y + 2, 3, 1, shade(o.shutter, -0.25)); R(g, x - 4, y + 6, 3, 1, shade(o.shutter, -0.25));
        R(g, x + 15, y + 2, 3, 1, shade(o.shutter, -0.25)); R(g, x + 15, y + 6, 3, 1, shade(o.shutter, -0.25));
      }
      R(g, x, y, 14, 13, bm); R(g, x + 2, y + 2, 10, 9, '#f2d27c'); R(g, x + 2, y + 2, 10, 3, '#f8e4a8');
      R(g, x + 6, y + 2, 2, 9, bm); R(g, x + 2, y + 6, 10, 1, bm); P(g, x + 3, y + 3, '#fffbe8');
      R(g, x - 1, y + 11, 16, 3, '#7a4a2c'); R(g, x - 1, y + 11, 16, 1, '#9a6a44');
      for (let i = 0; i < 7; i++) {
        P(g, x + i * 2 + 1, y + 10, '#4f8a3a');
        P(g, x + i * 2 + (i % 2), y + 9, pick(r, ['#e5484d', '#f28bb0', '#ffd35a', '#f07a4a', '#ffffff']));
      }
    }
    // door
    const dx = doorCX - 8, dy = wallBot - 28;
    R(g, dx, dy, 16, 28, bm);
    R(g, dx + 2, dy + 2, 12, 26, o.door); R(g, dx + 2, dy + 2, 12, 1, shade(o.door, 0.25));
    for (let x = dx + 5; x < dx + 14; x += 3) R(g, x, dy + 3, 1, 25, shade(o.door, -0.2));
    P(g, dx + 2, dy + 2, bm); P(g, dx + 13, dy + 2, bm);
    R(g, dx + 4, dy + 6, 8, 5, shade(o.door, -0.3)); R(g, dx + 5, dy + 7, 6, 3, '#f3d27a');
    R(g, dx + 10, dy + 15, 2, 2, '#e8c65a');
    R(g, dx - 2, wallBot - 2, 20, 2, '#b0aaa2');
    // hanging sign with an icon
    if (o.icon) {
      const sx = doorCX + 11, sy = wallTop + 26;
      R(g, sx, sy, 12, 1, '#2e2a33'); P(g, sx + 3, sy + 1, '#2e2a33'); P(g, sx + 10, sy + 1, '#2e2a33');
      R(g, sx + 1, sy + 2, 12, 11, '#c49a62'); R(g, sx + 1, sy + 2, 12, 1, '#dcb880'); R(g, sx + 1, sy + 12, 12, 1, '#8a6a42');
      iconOnSign(g, o.icon, sx + 3, sy + 4);
    }
    // lantern next to door
    R(g, dx - 6, dy + 4, 4, 5, '#2e2a33'); R(g, dx - 5, dy + 5, 2, 3, '#ffe39a');
  });
  s.doorX = doorCX - CW / 2;
  s.W = W;
  return s;
}

const TREE_PAL = {
  green: ['#2c4d2b', '#3c6934', '#55873d', '#76a54a', '#9cc35e'],
  lime: ['#3d5a29', '#56783a', '#76984a', '#9ab85a', '#c2d470'],
  autumn: ['#6b3a22', '#94502a', '#c07234', '#e0a14a', '#f2c46a'],
};

function makeTree(seed, palName) {
  const pal = TREE_PAL[palName];
  return sprite(48, 60, 24, 58, g => {
    const r = rng(seed);
    R(g, 20, 38, 7, 20, '#6b4a33'); R(g, 25, 38, 2, 20, '#4e3423'); R(g, 20, 40, 1, 18, '#86603f');
    R(g, 17, 55, 13, 3, '#6b4a33'); R(g, 16, 57, 3, 1, '#6b4a33'); R(g, 28, 57, 4, 1, '#4e3423');
    P(g, 22, 46, '#4e3423'); P(g, 23, 50, '#4e3423');
    const blobs = [];
    for (let i = 0; i < 10; i++) blobs.push([24 + (r() - 0.5) * 22, 22 + (r() - 0.5) * 16, 7 + r() * 5]);
    for (const [x, y, rad] of blobs) disc(g, x, y + 2, rad, pal[0]);
    for (const [x, y, rad] of blobs) disc(g, x - 1, y, rad - 1, pal[1]);
    for (const [x, y, rad] of blobs) disc(g, x - 2, y - 2, rad - 3, pal[2]);
    for (const [x, y, rad] of blobs) if (rad > 8.5) disc(g, x - 3, y - 4, rad - 6.5, pal[3]);
    for (const [x, y, rad] of blobs) {
      for (let k = 0; k < 10; k++) {
        const a = r() * Math.PI * 2, d = r() * (rad - 2);
        P(g, Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), pick(r, [pal[0], pal[1], pal[3]]));
      }
      if (rad > 9) P(g, Math.round(x - 4), Math.round(y - 5), pal[4]);
    }
  });
}

function makePine(seed) {
  return sprite(30, 54, 15, 52, g => {
    const r = rng(seed);
    R(g, 13, 42, 4, 11, '#5e412c'); R(g, 15, 42, 2, 11, '#46301f');
    const cols = ['#23433a', '#2f5a48', '#437459'];
    for (let i = 0; i < 5; i++) {
      const y = 4 + i * 8, w = 5 + i * 2.6;
      for (let k = 0; k <= 12; k++) {
        const hw = Math.round(w * k / 12);
        R(g, 15 - hw, y + k, hw * 2 + 1, 1, cols[0]);
        if (hw > 1) R(g, 15 - hw + 1, y + k, hw, 1, cols[1]);
        if (hw > 3 && k % 3 === 0) R(g, 15 - hw + 2, y + k, Math.max(1, hw - 3), 1, cols[2]);
      }
    }
    for (let i = 0; i < 20; i++) P(g, 8 + (r() * 14 | 0), 10 + (r() * 38 | 0), '#1b352d');
  });
}

function makeBush(seed, flowers) {
  return sprite(24, 16, 12, 15, g => {
    const r = rng(seed);
    const pal = TREE_PAL.green;
    const bl = [[7, 9, 6], [16, 9, 6], [12, 7, 6], [5, 11, 4], [19, 11, 4]];
    for (const [x, y, rd] of bl) disc(g, x, y + 1, rd, pal[0]);
    for (const [x, y, rd] of bl) disc(g, x - 1, y, rd - 1, pal[1]);
    for (const [x, y, rd] of bl) disc(g, x - 1, y - 1, rd - 3, pal[2]);
    for (let i = 0; i < 6; i++) P(g, 4 + (r() * 16 | 0), 4 + (r() * 8 | 0), pal[3]);
    if (flowers) for (let i = 0; i < 7; i++) P(g, 3 + (r() * 18 | 0), 3 + (r() * 9 | 0), flowers);
  });
}

function makeLamp() {
  return sprite(10, 46, 5, 45, g => {
    R(g, 4, 11, 2, 32, '#34303a'); R(g, 4, 11, 1, 32, '#4c4754');
    R(g, 2, 42, 6, 4, '#34303a'); R(g, 3, 40, 4, 2, '#34303a');
    R(g, 3, 9, 4, 2, '#34303a');
    R(g, 2, 3, 6, 7, '#34303a'); R(g, 3, 4, 4, 5, '#ffe7a0'); R(g, 3, 4, 2, 2, '#fff7d8');
    R(g, 1, 2, 8, 2, '#34303a'); P(g, 4, 0, '#34303a'); R(g, 4, 1, 2, 1, '#34303a');
  });
}

function makeBench() {
  return sprite(32, 18, 16, 17, g => {
    const w = '#9a6a40', wl = '#b98a5a', wd = '#6f4a2a', ir = '#3a3540';
    R(g, 3, 10, 2, 8, ir); R(g, 27, 10, 2, 8, ir); R(g, 3, 1, 2, 9, ir); R(g, 27, 1, 2, 9, ir);
    R(g, 1, 1, 30, 3, w); R(g, 1, 1, 30, 1, wl); R(g, 1, 5, 30, 3, w); R(g, 1, 5, 30, 1, wl);
    R(g, 0, 10, 32, 3, w); R(g, 0, 10, 32, 1, wl); R(g, 0, 13, 32, 1, wd);
  });
}

function makeFence(len) {
  return sprite(len, 16, 0, 15, g => {
    const c = '#ece4d3', s = '#bcae96';
    R(g, 0, 6, len, 2, s); R(g, 0, 11, len, 2, s);
    for (let x = 1; x < len - 1; x += 4) {
      R(g, x, 2, 2, 13, c); P(g, x, 1, c); R(g, x + 1, 2, 1, 13, s);
      P(g, x, 1, c); P(g, x + 1, 1, s); P(g, x, 0, c);
    }
  });
}

function makeClimbRock() {
  return sprite(46, 38, 23, 36, g => {
    const r = rng(7);
    const pts = [[4, 36], [1, 20], [9, 7], [22, 1], [36, 6], [45, 20], [42, 36]];
    poly(g, pts, '#8e939a');
    poly(g, [[4, 36], [1, 20], [9, 7], [22, 1], [20, 18], [16, 36]], '#b2b7bd');
    poly(g, [[9, 7], [22, 1], [36, 6], [20, 18]], '#c9cdd2');
    poly(g, [[36, 6], [45, 20], [42, 36], [30, 36], [20, 18]], '#7d828a');
    for (let i = 0; i < 40; i++) P(g, 4 + (r() * 38 | 0), 6 + (r() * 30 | 0), 'rgba(60,64,70,0.35)');
    const holds = ['#e5484d', '#ffd35a', '#4fb35a', '#4a8ad0', '#f07a4a', '#c86ad8'];
    for (let i = 0; i < 12; i++) {
      const x = 6 + (r() * 34 | 0), y = 8 + (r() * 24 | 0), c = pick(r, holds);
      R(g, x, y, 3, 2, c); P(g, x, y, shade(c, 0.4)); R(g, x, y + 2, 3, 1, shade(c, -0.4));
    }
  });
}

function makePosts() {
  return sprite(34, 34, 17, 32, g => {
    const logs = [[4, 12], [12, 4], [20, 16], [28, 8]];
    for (const [x, top] of logs) {
      R(g, x, top, 5, 32 - top, '#9a7048'); R(g, x + 3, top, 2, 32 - top, '#735134'); R(g, x, top, 1, 32 - top, '#b88c5e');
      oval(g, x + 2, top, 2, 1, '#d9b88a'); P(g, x + 2, top, '#a57a4c');
      for (let y = top + 4; y < 30; y += 7) P(g, x + 2, y, '#6a4a2e');
    }
  });
}

function makeSwingFrame() {
  return sprite(56, 44, 28, 42, g => {
    const w = '#8a5a38', wl = '#a8744a';
    line(g, 2, 42, 7, 4, w, 3); line(g, 12, 42, 7, 4, w, 3);
    line(g, 44, 42, 49, 4, w, 3); line(g, 54, 42, 49, 4, w, 3);
    R(g, 4, 2, 48, 4, w); R(g, 4, 2, 48, 1, wl); R(g, 4, 5, 48, 1, '#5e3b24');
    R(g, 6, 1, 3, 2, '#5e3b24'); R(g, 47, 1, 3, 2, '#5e3b24');
  });
}

// Slides seen from the side: ladder on the left, platform, chute down to the
// right. The local origin is the foot of the ladder; top / end / out are
// points on the chute surface relative to it. T is when Lina has climbed up,
// sat down and reached the bottom.
const SLIDES = {
  small: {
    top: [16, -34], end: [54, -4], out: [62, -4], ladder: 40, legs: [0.5],
    deck: ['#4a8ad0', '#7ab8ff', '#2f5f96'], chute: ['#ffd84a', '#e0b020', '#e5484d', '#b8322c'],
    T: { climb: 1.0, sit: 1.4, ride: 2.0 },
  },
  // the big one on the second playground: a little roof, and bumps on the way down
  big: {
    top: [22, -58], end: [100, -4], out: [110, -4], ladder: 64, legs: [0.3, 0.62], waves: 2, waveH: 3, roof: true,
    deck: ['#ffd35a', '#fff0a0', '#c99a2a'], chute: ['#7fd8e6', '#3fa8b8', '#f28bb0', '#c9668e'],
    T: { climb: 1.7, sit: 2.1, ride: 3.4 },
  },
};
function makeSlide(L) {
  const [tx, ty] = L.top, roofY = ty - 36;
  const h = 6 + Math.max(L.ladder, L.roof ? -roofY : 12 - ty);
  return sprite(L.out[0] + 6, h, 2, h - 4, g => {
    const X = x => 2 + x, Y = y => h - 4 + y;
    const steel = '#9aa0a8', steelSh = '#6c727a', steelHi = '#c9ced4';
    // support legs
    line(g, X(tx - 2), Y(ty), X(tx - 2), Y(0), steelSh, 2);
    for (const k of L.legs) {
      const x = Math.round(tx + (L.end[0] - tx) * k);
      line(g, X(x), Y(Math.round(slideSurface(L, x))), X(x + 2), Y(0), steelSh, 2);
    }
    // ladder
    for (const x of [0, 10]) { R(g, X(x), Y(-L.ladder), 2, L.ladder, steel); R(g, X(x), Y(-L.ladder), 1, L.ladder, steelHi); }
    for (let y = -4; y > 4 - L.ladder; y -= 5) R(g, X(2), Y(y), 8, 1, steelSh);
    // platform with a railing
    const [dk, dkHi, dkSh] = L.deck;
    R(g, X(-1), Y(ty - 1), tx + 2, 3, dk); R(g, X(-1), Y(ty - 1), tx + 2, 1, dkHi); R(g, X(-1), Y(ty + 1), tx + 2, 1, dkSh);
    R(g, X(tx - 3), Y(ty - 10), 2, 9, steel); R(g, X(0), Y(ty - 10), tx - 1, 2, steel); R(g, X(0), Y(ty - 10), tx - 1, 1, steelHi);
    if (L.roof) {
      for (const x of [-2, tx]) { R(g, X(x), Y(roofY + 7), 2, ty - roofY - 8, '#8a5a38'); R(g, X(x), Y(roofY + 7), 1, ty - roofY - 8, '#a8744a'); }
      poly(g, [[X(-7), Y(roofY + 10)], [X(tx / 2), Y(roofY + 1)], [X(tx + 7), Y(roofY + 10)]], '#e5484d');
      poly(g, [[X(-7), Y(roofY + 10)], [X(tx / 2), Y(roofY + 1)], [X(tx / 2), Y(roofY + 10)]], '#f06a6a');
      R(g, X(-7), Y(roofY + 10), tx + 14, 2, '#b8322c');
      R(g, X(tx / 2), Y(roofY - 5), 1, 6, '#6c727a'); poly(g, [[X(tx / 2 + 1), Y(roofY - 5)], [X(tx / 2 + 6), Y(roofY - 3)], [X(tx / 2 + 1), Y(roofY - 1)]], '#f28bb0');
    }
    // the chute with a rim, curving flat at the end
    const [ch, chSh, rim, rimSh] = L.chute;
    const pts = [];
    for (let x = tx; x < L.end[0]; x += 1) pts.push([x, Math.round(slideSurface(L, x))]);
    pts.push(L.end, L.out);
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      line(g, X(x0), Y(y0) + 1, X(x1), Y(y1) + 1, chSh, 3);
      line(g, X(x0), Y(y0), X(x1), Y(y1), ch);
      line(g, X(x0), Y(y0) - 2, X(x1), Y(y1) - 2, rim);
      line(g, X(x0), Y(y0) + 3, X(x1), Y(y1) + 3, rimSh);
    }
    // front legs
    R(g, X(L.end[0] + 4), Y(-2), 2, 2, steelSh);
  });
}
// Height of the chute surface above the ground at slide x (for Lina's ride).
function slideSurface(L, x) {
  const [tx, ty] = L.top, [ex, ey] = L.end;
  if (x >= ex) return ey;
  const k = Math.max(0, (x - tx) / (ex - tx));
  const e = k < 0.8 ? k / 0.8 * 0.9 : 0.9 + (1 - Math.pow(1 - (k - 0.8) / 0.2, 2)) * 0.1;
  const wave = L.waves && k < 0.8 ? Math.sin(k / 0.8 * Math.PI * 2 * L.waves) * L.waveH : 0;
  return ty + (ey - ty) * e + wave;
}

// Jungle gym: a cube of painted bars. The front face is w x h, split into
// cols x rows; the back face sits (dx, dy) behind it. Anchor: bottom centre
// of the front face. Lina climbs around on the front face.
const CLIMB = { w: 42, h: 36, cols: 3, rows: 3, dx: 10, dy: -7 };
function makeClimbFrame() {
  const { w, h, cols, rows, dx, dy } = CLIMB, cw = w / cols, rh = h / rows;
  const X0 = 1, Y0 = h - dy + 1;
  return sprite(w + dx + 4, h - dy + 4, X0 + w / 2, Y0, g => {
    const bar = (x0, y0, x1, y1, c) => line(g, x0, y0, x1, y1, c, 2);
    const red = '#e5484d', redHi = '#f58a8a', rungs = ['#4a8ad0', '#4fb35a', '#ffd35a'];
    // back face and the bars going back, darker
    const bx = X0 + dx, by = Y0 + dy;
    for (let i = 0; i <= cols; i++) bar(bx + i * cw, by, bx + i * cw, by - h, shade(red, -0.4));
    for (let j = 1; j <= rows; j++) bar(bx, by - j * rh, bx + w, by - j * rh, shade(rungs[j - 1], -0.4));
    for (let j = 1; j <= rows; j++) bar(X0 + w, Y0 - j * rh, bx + w, by - j * rh, shade(rungs[j - 1], -0.25));
    for (let i = 0; i < cols; i++) bar(X0 + i * cw, Y0 - h, bx + i * cw, by - h, shade(rungs[rows - 1], -0.25));
    bar(X0 + w, Y0, bx + w, by, '#6c727a');
    // front face: red posts and colourful rungs
    for (let j = 1; j <= rows; j++) bar(X0, Y0 - j * rh, X0 + w, Y0 - j * rh, rungs[j - 1]);
    for (let j = 1; j <= rows; j++) line(g, X0, Y0 - j * rh, X0 + w, Y0 - j * rh, shade(rungs[j - 1], 0.35));
    for (let i = 0; i <= cols; i++) { bar(X0 + i * cw, Y0, X0 + i * cw, Y0 - h, red); line(g, X0 + i * cw, Y0, X0 + i * cw, Y0 - h, redHi); }
    for (let i = 0; i <= cols; i++) R(g, X0 + i * cw - 1, Y0, 4, 1, '#6c727a');
  });
}

// A wooden play ice cream parlour: children serve sand ice cream here.
function makePlayIceStand() {
  return sprite(50, 54, 25, 53, g => {
    const wood = '#c8955a', woodSh = '#a0703e', woodHi = '#e0b47a', dark = '#6f4a2a';
    // plank walls
    R(g, 4, 22, 42, 31, wood);
    for (let x = 9; x < 44; x += 6) R(g, x, 22, 1, 31, woodSh);
    R(g, 4, 22, 1, 31, woodHi); R(g, 44, 22, 2, 31, woodSh);
    // serving hatch with a counter board
    R(g, 9, 28, 32, 12, '#4a3222'); R(g, 9, 28, 32, 2, '#3a2418');
    R(g, 11, 31, 2, 2, '#e5484d'); R(g, 15, 31, 2, 2, '#ffd35a'); R(g, 19, 31, 2, 2, '#8fc4ff');
    R(g, 6, 39, 38, 3, woodHi); R(g, 6, 41, 38, 1, dark);
    // painted lower panel with dots
    R(g, 6, 44, 38, 7, '#f7b6cf'); R(g, 6, 44, 38, 1, '#fbd3e2');
    for (let x = 9; x < 42; x += 5) P(g, x, 47 + (x % 2), ['#ffffff', '#8fc4ff', '#ffd35a'][(x / 5 | 0) % 3]);
    // on the counter: a red bucket with a shovel, and two sand ice creams in a holder
    R(g, 8, 35, 6, 4, '#e5484d'); R(g, 8, 35, 6, 1, '#f58a8a'); line(g, 12, 35, 15, 31, '#4a8ad0');
    R(g, 32, 37, 10, 2, dark);
    for (const x of [34, 39]) {
      poly(g, [[x - 1.5, 37], [x + 1.5, 37], [x, 40]], '#d9a55a');
      oval(g, x, 35, 2, 1, '#dcc48f'); P(g, x - 1, 34, '#ead6a8');
    }
    // roof with a scalloped mint edge
    R(g, 0, 16, 50, 4, '#6fc2a8'); R(g, 0, 16, 50, 1, '#9ee0cb');
    for (let x = 0; x < 50; x += 4) { R(g, x, 20, 3, 2, '#6fc2a8'); P(g, x + 1, 22, '#6fc2a8'); }
    // hand-painted sign: EIS in three colours and a cone
    R(g, 8, 13, 2, 4, dark); R(g, 40, 13, 2, 4, dark);
    R(g, 6, 2, 38, 12, '#fbf6ee'); R(g, 6, 2, 38, 1, '#ffffff'); R(g, 6, 13, 38, 1, '#c9c2b8');
    bitmap(g, LETTERS.E, 11, 5, '#e5484d'); bitmap(g, LETTERS.I, 16, 5, '#4a8ad0'); bitmap(g, LETTERS.S, 21, 5, '#4fb35a');
    poly(g, [[29.5, 8], [36.5, 8], [33, 13]], '#d9a55a'); oval(g, 33, 6, 3, 2, '#f7a6c4'); P(g, 32, 5, '#ffd0e0');
  });
}

function makeMailbox() {
  return sprite(10, 20, 5, 19, g => {
    R(g, 4, 9, 2, 11, '#5e3b24');
    R(g, 0, 1, 10, 9, '#e0463f'); R(g, 1, 0, 8, 1, '#e0463f'); R(g, 0, 1, 10, 2, '#f27069'); R(g, 0, 8, 10, 1, '#a82e29');
    R(g, 2, 4, 6, 1, '#6d1e1b'); P(g, 9, 3, '#ffd35a'); R(g, 9, 2, 1, 4, '#ffd35a');
  });
}

// ---- interior furniture ---------------------------------------------------
function makeBed() {
  return sprite(28, 42, 14, 41, g => {
    const w = '#8a5a38', wl = '#a8744a', wd = '#5e3b24';
    R(g, 1, 0, 26, 11, w); R(g, 3, 2, 22, 7, wl); R(g, 1, 0, 26, 1, wl);
    bitmap(g, BMP.heart, 11, 3, '#e8507e');
    R(g, 0, 0, 2, 42, wd); R(g, 26, 0, 2, 42, wd);
    R(g, 2, 11, 24, 26, '#f4efe6');
    R(g, 5, 12, 18, 6, '#ffffff'); R(g, 5, 17, 18, 1, '#d9d2c6');
    R(g, 2, 19, 24, 18, '#ec94b2'); R(g, 2, 19, 24, 3, '#f7bfd2'); R(g, 2, 35, 24, 2, '#c96d8f');
    for (const [x, y] of [[6, 25], [15, 24], [10, 30], [19, 30]]) bitmap(g, ['#.#', '###', '.#.'], x, y, '#ffffff');
    R(g, 1, 37, 26, 5, w); R(g, 1, 37, 26, 1, wl);
  });
}
function makeTeddy() {
  return sprite(12, 13, 6, 12, g => {
    const b = '#9a6b43', l = '#c99d6e', d = '#3a2418';
    disc(g, 2, 2, 2, b); disc(g, 9, 2, 2, b); P(g, 2, 2, l); P(g, 9, 2, l);
    R(g, 2, 7, 8, 5, b); R(g, 4, 8, 4, 3, l); R(g, 0, 8, 2, 3, b); R(g, 10, 8, 2, 3, b);
    R(g, 1, 11, 3, 2, l); R(g, 8, 11, 3, 2, l);
    disc(g, 6, 4, 3, b); R(g, 4, 5, 4, 2, l); P(g, 4, 3, d); P(g, 7, 3, d); P(g, 5, 5, d); P(g, 6, 5, d);
    R(g, 5, 7, 2, 1, '#e0607f'); P(g, 4, 7, '#f07fa0'); P(g, 7, 7, '#f07fa0');
  });
}
function makeToyBox() {
  return sprite(22, 20, 11, 19, g => {
    R(g, 1, 0, 20, 5, '#6f4a2a');
    disc(g, 6, 5, 3, '#e5484d'); P(g, 5, 4, '#ff9a9a');
    R(g, 12, 2, 5, 5, '#4a8ad0'); R(g, 12, 2, 5, 1, '#7fb2ee');
    R(g, 9, 4, 3, 3, '#ffd35a');
    R(g, 0, 7, 22, 13, '#b07a48'); R(g, 0, 7, 22, 2, '#cc9660'); R(g, 0, 18, 22, 2, '#86592f');
    R(g, 2, 11, 18, 1, '#86592f'); R(g, 2, 15, 18, 1, '#86592f');
    bitmap(g, BMP.star, 9, 11, '#ffd35a');
  });
}
function makeBookshelf() {
  return sprite(28, 40, 14, 39, g => {
    const w = '#6f4a2a', wl = '#8e6440';
    R(g, 0, 0, 28, 40, w); R(g, 0, 0, 28, 2, wl);
    const r = rng(5);
    for (let s = 0; s < 3; s++) {
      const y = 3 + s * 12;
      R(g, 2, y, 24, 10, '#3e2818');
      let x = 3;
      while (x < 24) {
        const bw = 2 + (r() * 2 | 0), bh = 6 + (r() * 3 | 0);
        R(g, x, y + 10 - bh, bw, bh, pick(r, ['#e5484d', '#4a8ad0', '#ffd35a', '#4fb35a', '#f28bb0', '#f07a4a', '#c86ad8']));
        x += bw + (r() < 0.2 ? 1 : 0);
      }
      R(g, 1, y + 10, 26, 2, wl);
    }
  });
}
function makePlant() {
  return sprite(14, 22, 7, 21, g => {
    R(g, 3, 14, 8, 8, '#c0683f'); R(g, 2, 13, 10, 2, '#d8804f'); R(g, 9, 15, 2, 7, '#9a4f2c');
    const L = ['#3c6934', '#55873d', '#76a54a'];
    line(g, 7, 13, 2, 3, L[0], 2); line(g, 7, 13, 12, 4, L[1], 2); line(g, 7, 13, 7, 0, L[2], 2);
    line(g, 7, 13, 3, 8, L[1], 2); line(g, 7, 13, 11, 9, L[0], 2);
  });
}
function makeCounter() {
  return sprite(64, 26, 32, 25, g => {
    R(g, 0, 8, 64, 18, '#8a5a38'); R(g, 0, 8, 64, 2, '#a8744a'); R(g, 0, 24, 64, 2, '#5e3b24');
    for (let x = 4; x < 64; x += 15) { R(g, x, 12, 11, 10, '#7a4e30'); R(g, x, 12, 11, 1, '#5e3b24'); }
    R(g, 0, 4, 64, 5, '#d6b48a'); R(g, 0, 4, 64, 1, '#ecd2ad');
    for (const x of [6, 26, 46]) {
      oval(g, x + 5, 4, 6, 3, '#9a6a40'); oval(g, x + 5, 3, 5, 2, '#b98a5a');
      oval(g, x + 3, 1, 3, 2, '#c6863f'); oval(g, x + 7, 1, 3, 2, '#d8964c'); P(g, x + 3, 0, '#f0c07a');
    }
  });
}
function makeBreadShelf() {
  return sprite(44, 36, 22, 35, g => {
    R(g, 0, 0, 44, 36, '#6f4a2a'); R(g, 0, 0, 44, 2, '#8e6440');
    for (let s = 0; s < 3; s++) {
      const y = 3 + s * 11;
      R(g, 2, y, 40, 9, '#3e2818'); R(g, 1, y + 9, 42, 2, '#8e6440');
      for (let i = 0; i < 4; i++) {
        const x = 4 + i * 10;
        if ((s + i) % 2) {
          oval(g, x + 3, y + 6, 4, 2, '#c6863f'); oval(g, x + 3, y + 5, 3, 1, '#e2a95c');
          P(g, x + 1, y + 5, '#8a5320'); P(g, x + 4, y + 5, '#8a5320');
        } else { // pretzel
          const c = '#a8602a';
          R(g, x, y + 3, 7, 1, c); R(g, x, y + 3, 1, 5, c); R(g, x + 6, y + 3, 1, 5, c);
          R(g, x + 1, y + 8, 5, 1, c); line(g, x + 1, y + 7, x + 5, y + 4, c); line(g, x + 5, y + 7, x + 1, y + 4, c);
          P(g, x + 2, y + 3, '#f5f0e6'); P(g, x + 5, y + 6, '#f5f0e6');
        }
      }
    }
  });
}
function makeOven() {
  return sprite(34, 38, 17, 37, g => {
    const b = '#a0523c', bd = '#7a3a2a', bl = '#bd6a50';
    disc(g, 17, 16, 15, b); R(g, 2, 16, 31, 22, b);
    for (let y = 4; y < 38; y += 4) for (let x = ((y / 4) % 2) * 3; x < 34; x += 6) R(g, x, y, 1, 3, bd);
    for (let y = 4; y < 38; y += 4) R(g, 0, y, 34, 1, bd);
    disc(g, 12, 10, 5, bl);
    R(g, 9, 20, 16, 14, '#2a1510'); disc(g, 17, 21, 8, '#2a1510');
    R(g, 11, 27, 12, 6, '#ff9a3c'); R(g, 13, 24, 8, 4, '#ffd24a'); R(g, 15, 22, 4, 3, '#fff0a0');
    R(g, 3, 34, 28, 4, '#6d6660'); R(g, 3, 34, 28, 1, '#8d8781');
  });
}
function makeCakeTable() {
  return sprite(22, 26, 11, 25, g => {
    R(g, 3, 14, 2, 12, '#6f4a2a'); R(g, 17, 14, 2, 12, '#6f4a2a');
    R(g, 0, 11, 22, 4, '#a8744a'); R(g, 0, 11, 22, 1, '#c89468'); R(g, 0, 15, 22, 1, '#5e3b24');
    R(g, 4, 5, 14, 7, '#f7bfd2'); R(g, 4, 5, 14, 2, '#ffffff'); R(g, 4, 9, 14, 1, '#e8799e');
    P(g, 6, 7, '#ffffff'); P(g, 9, 8, '#ffffff'); P(g, 13, 7, '#ffffff'); P(g, 16, 8, '#ffffff');
    R(g, 10, 1, 2, 4, '#7ac8ff'); P(g, 10, 0, '#ffd24a'); P(g, 11, 0, '#ff9a3c');
    P(g, 6, 5, '#e5484d'); P(g, 15, 5, '#e5484d');
  });
}
function makePiano() {
  return sprite(40, 34, 20, 33, g => {
    const b = '#4a2e22', bl = '#6a4432';
    R(g, 0, 0, 40, 22, b); R(g, 0, 0, 40, 2, bl); R(g, 3, 4, 34, 8, '#3a2219'); R(g, 5, 6, 30, 4, bl);
    R(g, 0, 20, 40, 5, b); R(g, 1, 21, 38, 3, '#f7f3ea');
    for (let x = 3; x < 38; x += 3) P(g, x, 23, '#b8b2a6');
    for (let x = 3; x < 38; x += 3) if ((x / 3 | 0) % 7 !== 2 && (x / 3 | 0) % 7 !== 6) R(g, x + 1, 21, 1, 2, '#1d1410');
    R(g, 2, 25, 3, 9, b); R(g, 35, 25, 3, 9, b);
    R(g, 14, 29, 12, 5, '#6a4432'); R(g, 14, 29, 12, 1, '#8a5a40');
    R(g, 6, -2 + 2, 3, 3, '#ffd24a');
  });
}
function makeDrum() {
  return sprite(18, 18, 9, 17, g => {
    R(g, 1, 6, 16, 10, '#d8404a'); R(g, 1, 6, 16, 1, '#f06a70'); R(g, 1, 14, 16, 2, '#9a2a32');
    for (let x = 2; x < 17; x += 4) line(g, x, 7, x + 2, 14, '#ffd35a');
    oval(g, 9, 6, 8, 3, '#f5efe2'); oval(g, 9, 6, 6, 2, '#ffffff');
    line(g, 3, 1, 9, 5, '#c89468', 1); line(g, 15, 1, 10, 5, '#c89468', 1);
    P(g, 3, 1, '#f5efe2'); P(g, 15, 1, '#f5efe2');
  });
}
function makeXylo() {
  return sprite(30, 14, 15, 13, g => {
    R(g, 0, 3, 30, 2, '#8a5a38'); R(g, 0, 10, 30, 2, '#8a5a38');
    const cols = ['#e5484d', '#f07a4a', '#ffd35a', '#4fb35a', '#4a8ad0', '#8a6ad8', '#e87ab8'];
    cols.forEach((c, i) => { const h = 12 - Math.round(i * 0.8); R(g, 2 + i * 4, 1 + (12 - h) / 2 | 0, 3, h, c); P(g, 2 + i * 4, 2, shade(c, 0.4)); });
    R(g, 1, 12, 2, 2, '#5e3b24'); R(g, 27, 12, 2, 2, '#5e3b24');
  });
}
function makeGuitar() {
  return sprite(12, 30, 6, 29, g => {
    R(g, 5, 0, 2, 3, '#3a2219'); R(g, 5, 3, 2, 14, '#6a4432');
    disc(g, 6, 18, 4, '#d88a3c'); disc(g, 6, 24, 5, '#d88a3c'); disc(g, 6, 22, 1, '#3a2219');
    R(g, 4, 27, 5, 1, '#6a4432'); P(g, 4, 20, '#f0b060');
  });
}
function makeMirror() {
  return sprite(16, 32, 8, 31, g => {
    const w = '#b07a48', wl = '#d09a64', wd = '#7a4e30';
    R(g, 2, 26, 2, 6, wd); R(g, 12, 26, 2, 6, wd); R(g, 1, 30, 14, 2, wd);
    oval(g, 8, 13, 7, 13, w); oval(g, 8, 13, 5, 11, '#b9dcec');
    oval(g, 8, 15, 4, 8, '#9fc9de');
    line(g, 5, 8, 9, 3, '#eaf7fd'); line(g, 6, 11, 11, 5, '#eaf7fd');
    P(g, 8, 0, wl); R(g, 7, 1, 3, 1, wl); disc(g, 8, 0, 1, '#f28bb0');
  });
}

// ---- Crossroads: pedestrian lights and the building site --------------------
const PED_STAND = ['..#..', '.###.', '.###.', '.###.', '.#.#.', '.#.#.'];
const PED_WALK = ['..#..', '.###.', '#.#.#', '..#..', '.#.#.', '#...#'];

// Pedestrian light: signal head on a pole with the yellow push-button box.
// The lit lamps are drawn live on top of this (see scenes.js).
function makePedLight() {
  return sprite(12, 50, 5, 49, g => {
    const m = '#34363e', mh = '#50535c';
    R(g, 4, 14, 2, 33, '#7a7f88'); R(g, 4, 14, 1, 33, '#a3a8b0');
    R(g, 3, 46, 4, 4, m); R(g, 3, 46, 4, 1, mh);
    R(g, 1, 0, 7, 15, m); R(g, 1, 0, 7, 1, mh); R(g, 1, 7, 7, 1, mh);
    R(g, 2, 1, 5, 6, '#121216'); R(g, 2, 8, 5, 6, '#121216');
    bitmap(g, PED_STAND, 2, 1, '#3a1a18'); bitmap(g, PED_WALK, 2, 8, '#18301f');
    R(g, 6, 24, 5, 8, '#f5c518'); R(g, 10, 24, 1, 8, '#c99a0c'); R(g, 6, 24, 5, 1, '#ffe36a');
    R(g, 7, 25, 3, 2, '#2b2b30'); R(g, 7, 28, 3, 2, '#4a4d55'); P(g, 7, 28, '#7a7f88');
  });
}

// Red and white barrier board on two feet, with a warning lamp on the left.
function makeBarrier(len) {
  return sprite(len, 16, 0, 15, g => {
    const legs = [2, len - 4];
    for (let x = 34; x < len - 20; x += 32) legs.push(x);
    for (const x of legs) { R(g, x, 8, 2, 6, '#e8e4dc'); R(g, x - 2, 14, 6, 2, '#3a3540'); }
    for (let y = 4; y < 8; y++) for (let x = 0; x < len; x++) P(g, x, y, ((x + y) >> 2) & 1 ? '#f4f1ea' : '#d8322c');
    R(g, 0, 7, len, 1, 'rgba(0,0,0,0.2)');
    R(g, 0, 0, 4, 4, '#2b2b30'); R(g, 1, 1, 2, 2, '#8a6a1a');
  });
}

function makeCone() {
  return sprite(9, 12, 4, 11, g => {
    R(g, 0, 10, 9, 2, '#d0561a'); R(g, 0, 11, 9, 1, '#a8420e');
    poly(g, [[3.5, 0], [5.5, 0], [7.5, 10], [1.5, 10]], '#f47a2a');
    poly(g, [[2.7, 4], [6.3, 4], [6.7, 6], [2.3, 6]], '#f4f1ea');
    P(g, 3, 2, '#ffa864'); P(g, 3, 7, '#ffa864'); P(g, 6, 8, '#c85a18');
  });
}

// "Men at work" sign on a weighted stand.
function makeWorkSign() {
  return sprite(17, 27, 8, 26, g => {
    R(g, 7, 13, 2, 11, '#8a8f98'); R(g, 7, 13, 1, 11, '#b0b5bd');
    R(g, 2, 23, 13, 3, '#d8322c'); R(g, 2, 23, 13, 1, '#f06a5a');
    poly(g, [[8.5, 0], [16.5, 14], [0.5, 14]], '#d8322c');
    poly(g, [[8.5, 3.5], [13.5, 12], [3.5, 12]], '#f4f2ea');
    const k = '#1d130f';
    P(g, 7, 6, k); R(g, 7, 7, 1, 3, k); P(g, 6, 10, k); P(g, 8, 10, k); line(g, 8, 8, 10, 10, k);
    R(g, 9, 11, 3, 1, k); P(g, 10, 10, k);
  });
}

// Heap of sand with a shovel stuck in it.
function makeSandPile() {
  return sprite(30, 18, 15, 17, g => {
    line(g, 21, 1, 18, 9, '#9a6a40'); R(g, 19, 0, 5, 1, '#6f4a2a');
    oval(g, 15, 13, 14, 4, '#a67c4c'); oval(g, 14, 11, 11, 5, '#c29a62'); oval(g, 13, 9, 7, 4, '#d4ae76');
    const r = rng(77);
    for (let i = 0; i < 40; i++) P(g, 3 + (r() * 24 | 0), 7 + (r() * 9 | 0), pick(r, ['#b38956', '#e0c08a', '#9a7244']));
    oval(g, 15, 16, 13, 1, '#8f6a3e');
  });
}

// Construction worker with helmet, ear defenders and a jackhammer.
// pose 0 / 1: hammering (1 is the recoil), 'wave': waving hello.
function makeWorker(pose) {
  return sprite(24, 39, 12, 38, g => {
    g.translate(0, 1);
    const o = pose === 1 ? -1 : 0;
    const skin = '#eab48e', skinSh = '#d29873', vest = '#ff7a1a', vestSh = '#d65e0c', refl = '#f4f2dc';
    const shirt = '#3d6aa8', pants = '#34507c', pantsSh = '#27405f', boot = '#5a3a22';
    const helm = '#f5c518', helmSh = '#c99a0c', helmHi = '#ffe36a', steel = '#a3a8b0', steelSh = '#6c727a', dark = '#2b2b30';
    // legs + work boots
    R(g, 7, 26, 4, 9, pants); R(g, 13, 26, 4, 9, pants); R(g, 10, 26, 1, 9, pantsSh); R(g, 16, 26, 1, 9, pantsSh);
    R(g, 6, 35, 5, 3, boot); R(g, 13, 35, 5, 3, boot); R(g, 6, 35, 5, 1, '#7a5234'); R(g, 13, 35, 5, 1, '#7a5234');
    // orange hi-vis vest with reflective stripes over a blue shirt
    R(g, 6, 13 + o, 12, 13, vest); R(g, 16, 13 + o, 2, 13, vestSh);
    R(g, 10, 13 + o, 4, 2, shirt); R(g, 11, 15 + o, 2, 1, shirt);
    R(g, 6, 19 + o, 12, 1, refl); R(g, 6, 23 + o, 12, 1, refl);
    R(g, 6, 25 + o, 12, 1, '#4a3222');
    // face with a big moustache, red ear defenders, yellow helmet
    R(g, 8, 6 + o, 8, 7, skin); R(g, 15, 7 + o, 1, 5, skinSh);
    P(g, 10, 8 + o, '#1d130f'); P(g, 13, 8 + o, '#1d130f');
    P(g, 9, 10 + o, '#f0a08a'); P(g, 14, 10 + o, '#f0a08a');
    R(g, 10, 10 + o, 4, 1, '#6b4430');
    if (pose === 'wave') R(g, 11, 11 + o, 2, 1, '#8a3a32');
    R(g, 6, 6 + o, 2, 5, '#d8322c'); R(g, 16, 6 + o, 2, 5, '#d8322c'); P(g, 6, 6 + o, '#f06a5a'); P(g, 16, 6 + o, '#f06a5a');
    R(g, 8, 0 + o, 8, 1, helm); R(g, 7, 1 + o, 10, 4, helm); R(g, 5, 5 + o, 14, 1, helmSh);
    R(g, 11, 0 + o, 2, 5, helmSh); R(g, 8, 1 + o, 2, 2, helmHi);
    // the jackhammer, standing in front of him
    R(g, 11, 27 + o, 2, 11, steelSh);
    R(g, 9, 18 + o, 6, 10, steel); R(g, 13, 18 + o, 2, 10, steelSh); R(g, 9, 18 + o, 1, 10, '#c9ced4');
    R(g, 8, 17 + o, 8, 3, '#e0621a'); R(g, 8, 17 + o, 8, 1, '#f4904a');
    R(g, 4, 16 + o, 16, 2, dark);
    // arms: both hands on the grips, or one waving
    R(g, 4, 13 + o, 2, 4, shirt); R(g, 4, 16 + o, 3, 2, skin);
    if (pose === 'wave') { R(g, 18, 7, 2, 7, shirt); R(g, 18, 4, 2, 3, skin); }
    else { R(g, 18, 13 + o, 2, 4, shirt); R(g, 17, 16 + o, 3, 2, skin); }
  });
}

// ---- Ice cream stand -------------------------------------------------------
const ICE_FLAVORS = ['#f7a6c4', '#8a5634', '#fff0c4', '#a8d88a', '#ff9a6a', '#8fc4ff'];
const LETTERS = {
  E: ['###', '#..', '##.', '#..', '###'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
};

// A little kiosk with a striped awning. Drawn in two layers so the seller
// can stand in the serving window: 'back' is the inside, 'front' the rest.
function makeIceStand(layer) {
  if (layer === 'back') {
    return sprite(52, 60, 26, 59, g => {
      R(g, 10, 27, 32, 15, '#6a4e5a'); R(g, 10, 27, 32, 2, '#57404a');
      R(g, 12, 32, 28, 1, '#8a6a74');
      for (let x = 13; x < 39; x += 4) { R(g, x, 29, 3, 3, '#d9a55a'); P(g, x + 1, 31, '#b07a38'); }
    }, { noOutline: true });
  }
  return sprite(52, 60, 26, 59, g => {
    const wall = '#bfe6d6', wallSh = '#94c9b6', wallHi = '#dcf3ea', pink = '#f28bb0', pinkD = '#d9668e', white = '#fbf6ee', wood = '#b98a5a';
    // walls with the serving window cut out (a see-through hole)
    R(g, 2, 18, 48, 38, wall); R(g, 2, 18, 2, 38, wallHi); R(g, 46, 18, 4, 38, wallSh);
    g.clearRect(10, 27, 32, 15); R(g, 10, 27, 32, 15, HOLE);
    R(g, 9, 26, 34, 1, wood); R(g, 9, 26, 1, 16, wood); R(g, 42, 26, 1, 16, wood);
    // counter and a glass display full of ice cream tubs
    R(g, 6, 41, 40, 3, white); R(g, 6, 41, 40, 1, '#ffffff'); R(g, 6, 44, 40, 1, '#c9c2b8');
    R(g, 7, 45, 38, 10, '#9fb8c0'); R(g, 8, 45, 36, 9, '#d7eef5');
    ICE_FLAVORS.forEach((c, i) => {
      const x = 9 + i * 6;
      R(g, x, 48, 5, 1, shade(c, 0.3)); R(g, x, 49, 5, 2, c); R(g, x, 51, 5, 2, '#c9c2b8');
    });
    line(g, 10, 53, 14, 46, 'rgba(255,255,255,0.7)'); line(g, 30, 53, 33, 47, 'rgba(255,255,255,0.5)');
    // pink base
    R(g, 2, 55, 48, 5, pinkD); R(g, 2, 55, 48, 1, pink);
    // roof and a pink and white awning with a scalloped edge
    R(g, 0, 12, 52, 4, white); R(g, 0, 15, 52, 1, '#c9c2b8');
    for (let x = 0; x < 52; x++) {
      const col = (x >> 2) & 1 ? white : pink, k = x & 3;
      R(g, x, 16, 1, 8, col);
      if (k === 1 || k === 2) P(g, x, 24, col);
    }
    R(g, 0, 16, 52, 1, 'rgba(255,255,255,0.4)'); R(g, 0, 23, 52, 1, 'rgba(120,40,70,0.15)');
    // sign on the roof: EIS and a cone
    R(g, 11, 1, 30, 11, pinkD); R(g, 12, 2, 28, 9, white);
    bitmap(g, LETTERS.E, 15, 4, pinkD); bitmap(g, LETTERS.I, 19, 4, pinkD); bitmap(g, LETTERS.S, 23, 4, pinkD);
    poly(g, [[29.5, 7], [35.5, 7], [32.5, 11]], '#d9a55a'); oval(g, 32, 5, 2, 2, pink); P(g, 31, 4, '#ffd0e0');
  });
}

// The ice cream seller, seen above the counter.
// pose: 'idle', 'scoop' (arm up with the scoop) or 'give' (handing it over)
function makeSeller(pose) {
  return sprite(20, 22, 10, 21, g => {
    const hair = '#a4502e', hairHi = '#c96c44', skin = '#f3c9a8', shirt = '#f28bb0', shirtSh = '#d9668e', apron = '#fbf6ee';
    // striped shirt + apron
    R(g, 4, 12, 12, 10, shirt); R(g, 14, 12, 2, 10, shirtSh);
    for (let y = 13; y < 22; y += 2) R(g, 4, y, 12, 1, '#fbe0ea');
    R(g, 6, 14, 8, 8, apron); R(g, 6, 13, 1, 1, apron); R(g, 13, 13, 1, 1, apron); R(g, 8, 18, 4, 2, '#f7b6cf');
    // face, hair bun and a pink headband
    R(g, 6, 5, 8, 7, skin);
    disc(g, 10, 1, 2, hair); P(g, 9, 0, hairHi);
    R(g, 5, 3, 10, 3, hair); R(g, 5, 6, 1, 6, hair); R(g, 14, 6, 1, 6, hair); R(g, 6, 6, 2, 1, hair); R(g, 12, 6, 2, 1, hair);
    R(g, 5, 4, 10, 1, '#8fc4ff'); R(g, 7, 3, 3, 1, hairHi);
    P(g, 8, 8, '#1d130f'); P(g, 11, 8, '#1d130f');
    P(g, 7, 10, '#f2a292'); P(g, 12, 10, '#f2a292');
    R(g, 9, 10, 2, 1, '#c46c62'); if (pose !== 'idle') P(g, 9, 11, '#c46c62');
    // arms
    R(g, 2, 13, 2, 8, shirt);
    if (pose === 'scoop') { R(g, 16, 7, 2, 6, shirt); R(g, 16, 5, 2, 2, skin); R(g, 16, 2, 3, 3, '#c0c4ca'); P(g, 17, 3, '#e8ecf0'); }
    else if (pose === 'give') { R(g, 16, 13, 2, 4, shirt); R(g, 17, 16, 2, 3, shirt); R(g, 17, 19, 2, 2, skin); }
    else R(g, 16, 13, 2, 8, shirt);
  });
}

// An ice cream cone with its tip at (x, y), drawn live in world pixels.
function drawIceCone(ctx, x, y, scoops) {
  x = Math.round(x); y = Math.round(y);
  const F = (c, px, py, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + px, y + py, w, h); };
  const d = '#2a1c18';
  F(d, -3, -6, 7, 3); F(d, -2, -3, 5, 2); F(d, -1, -1, 3, 2);
  F('#d9a55a', -2, -5, 5, 2); F('#d9a55a', -1, -3, 3, 2); F('#d9a55a', 0, -1, 1, 1);
  F('#b07a38', -1, -5, 1, 1); F('#b07a38', 1, -4, 1, 1); F('#b07a38', 0, -2, 1, 1);
  scoops.forEach((c, i) => {
    const b = -6 - i * 4;
    F(d, -2, b - 4, 5, 1); F(d, -3, b - 3, 7, 4);
    F(c, -1, b - 3, 3, 1); F(c, -2, b - 2, 5, 3);
    F(shade(c, 0.45), -1, b - 2, 1, 1);
  });
}
