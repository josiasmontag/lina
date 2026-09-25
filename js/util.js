'use strict';
// ---------------------------------------------------------------------------
// Small pixel-art toolkit: offscreen canvases, rect/line/disc/poly primitives,
// automatic dark outlines (Graveyard Keeper style) and anchored sprites.
// ---------------------------------------------------------------------------

const TILE = 16;

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  return [c, g];
}

function R(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }
function P(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }

function line(g, x0, y0, x1, y1, col, t = 1) {
  g.fillStyle = col;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  const o = (t - 1) >> 1;
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
    g.fillRect(x - o, y - o, t, t);
  }
}

function disc(g, cx, cy, r, col) {
  g.fillStyle = col;
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r + r * 0.6 - dy * dy));
    g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}

function oval(g, cx, cy, rx, ry, col) {
  g.fillStyle = col;
  for (let dy = -ry; dy <= ry; dy++) {
    const t = 1 - (dy * dy) / ((ry + 0.5) * (ry + 0.5));
    if (t < 0) continue;
    const w = Math.round(rx * Math.sqrt(t));
    g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}

// Scanline polygon fill without anti-aliasing.
function poly(g, pts, col) {
  g.fillStyle = col;
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const yy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) {
        xs.push(a[0] + (yy - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = Math.round(xs[i]), x1 = Math.round(xs[i + 1]);
      if (x1 > x0) g.fillRect(x0, y, x1 - x0, 1);
    }
  }
}

// Draw a little bitmap: rows of '#' (or a char->color map).
function bitmap(g, rows, x, y, col) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '.' || ch === ' ') continue;
      P(g, x + i, y + j, typeof col === 'string' ? col : col[ch]);
    }
  });
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function shade(hex, f) {
  const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + hexRgb(hex).map(m).map(v => v.toString(16).padStart(2, '0')).join('');
}

// Adds a 1px dark outline around every opaque shape. Pixels with a tiny
// non-zero alpha are treated as "holes" (e.g. inside bike wheels) and stay clear.
const HOLE = 'rgba(0,0,0,0.012)';
function outline(src, col = '#2a1c18') {
  const w = src.width, h = src.height;
  const [c, g] = makeCanvas(w + 2, h + 2);
  const sd = src.getContext('2d').getImageData(0, 0, w, h).data;
  const img = g.createImageData(w + 2, h + 2), d = img.data;
  const [cr, cg, cb] = hexRgb(col);
  const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && sd[(y * w + x) * 4 + 3] > 40;
  for (let y = 0; y < h + 2; y++) for (let x = 0; x < w + 2; x++) {
    const sx = x - 1, sy = y - 1;
    if (sx >= 0 && sy >= 0 && sx < w && sy < h && sd[(sy * w + sx) * 4 + 3] > 0) continue;
    if (A(sx - 1, sy) || A(sx + 1, sy) || A(sx, sy - 1) || A(sx, sy + 1)) {
      const i = (y * (w + 2) + x) * 4;
      d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  g.drawImage(src, 1, 1);
  return c;
}

function mirrorCanvas(src) {
  const [c, g] = makeCanvas(src.width, src.height);
  g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
  return c;
}

// A sprite is a canvas plus an anchor point (usually where it touches the ground).
function sprite(w, h, ax, ay, fn, opts = {}) {
  const [c, g] = makeCanvas(w, h);
  fn(g);
  if (opts.noOutline) return { c, ax, ay };
  return { c: outline(c, opts.outline), ax: ax + 1, ay: ay + 1 };
}
function mirrorSprite(s) { return { c: mirrorCanvas(s.c), ax: s.c.width - s.ax, ay: s.ay }; }
// World pixels are drawn WS device pixels wide. Positions snap to device
// pixels (not whole game pixels) so movement and scrolling glide smoothly.
let WS = 3;
function snapPx(v) { return Math.round(v * WS) / WS; }
function drawSprite(ctx, s, x, y) { ctx.drawImage(s.c, snapPx(x - s.ax), snapPx(y - s.ay)); }

const _shadowCache = {};
function drawShadow(ctx, x, y, rx, ry, a = 0.3) {
  const k = rx + '_' + ry + '_' + a;
  let s = _shadowCache[k];
  if (!s) {
    const [c, g] = makeCanvas(rx * 2 + 1, ry * 2 + 1);
    oval(g, rx, ry, rx, ry, `rgba(34,22,38,${a})`);
    s = _shadowCache[k] = c;
  }
  ctx.drawImage(s, snapPx(x - rx), snapPx(y - ry));
}

function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
