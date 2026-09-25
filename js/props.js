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
