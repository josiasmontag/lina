'use strict';
// ---------------------------------------------------------------------------
// The Wiesn: a little Oktoberfest at the top of the side street, through a
// gate with WIESN on it. Buy a gingerbread heart to wear, sit down at a beer
// table and the waitress brings a Maß and a Brezn, ride the carousel and the
// Ferris wheel. Grown-ups in Tracht stroll about, and now and then the whole
// beer garden sways along to the band.
// ---------------------------------------------------------------------------

const WIESN = { W: 576, H: 448 };
const TAU = Math.PI * 2;
const BLUE = '#3b72b8', WHITE = '#f4f1ea';

// ---- lettering ------------------------------------------------------------------
const FONT = {
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
};
function textWidth(s, k = 1) { let w = -1; for (const ch of s) w += (FONT[ch] || ['..'])[0].length + 1; return w * k; }
function lettering(g, s, x, y, col, k = 1) {
  for (const ch of s) {
    const b = FONT[ch] || ['..'];
    b.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') R(g, x + i * k, y + j * k, k, k, col); });
    x += (b[0].length + 1) * k;
  }
}
// Blue and white diamonds, the Bavarian way.
const rauten = (x, y) => ((((x + y) >> 2) + ((x - y + 400) >> 2)) & 1 ? BLUE : WHITE);
// A pole wrapped in a blue and white spiral, like a maypole.
function spiralPole(g, x0, y0, w, h) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) P(g, x, y, ((y - x * 2 + 400) >> 3) & 1 ? BLUE : WHITE);
  R(g, x0 + w - 1, y0, 1, h, 'rgba(30,40,80,0.2)');
}

// ---- gingerbread hearts, the Maß and the Brezn ---------------------------------
const HEART9 = ['.##...##.', '####.####', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'];
const HEART13 = ['..###...###..', '.#####.#####.', '#############', '#############', '#############', '.###########.',
  '..#########..', '...#######...', '....#####....', '.....###.....', '......#......'];
const HEART_ICING = ['#f28bb0', '#fbf6ee', '#ffd35a', '#8fc4ff', '#a8d88a'];

// A gingerbread heart with a piped icing rim and a line of writing, top left
// at (x, y). Works on sprite canvases and on the game canvas alike.
function lebHeart(g, x, y, icing, big = false) {
  const B = big ? HEART13 : HEART9, h = B.length, w = B[0].length;
  const inside = (i, j) => j >= 0 && j < h && i >= 0 && i < w && B[j][i] === '#';
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (!inside(i, j)) continue;
    const rim = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1);
    P(g, x + i, y + j, rim ? icing : '#9a5a2e');
  }
  if (big) {
    for (const i of [3, 5, 7, 9]) P(g, x + i, y + 4, '#fbf6ee');
    R(g, x + 4, y + 6, 5, 1, '#fbf6ee'); P(g, x + 3, y + 2, '#e5484d'); P(g, x + 9, y + 2, '#4fb35a');
  } else R(g, x + 3, y + 3, 3, 1, '#fbf6ee');
}

// A Maß: a dimpled litre glass, level 4 (full, foam on top) down to 0 (empty).
// Anchored at the bottom middle of the glass.
function makeMass(level) {
  return sprite(9, 11, 3, 10, g => {
    R(g, 0, 1, 6, 10, '#dcecf0');
    const top = 10 - level * 2;
    if (level) { R(g, 0, top, 6, 11 - top, '#f0a82a'); R(g, 1, top, 1, 11 - top, '#ffd060'); }
    for (let y = 3; y < 10; y += 3) for (let x = (y / 3) & 1; x < 6; x += 2) P(g, x, y, level && y >= top ? '#d88a18' : '#bcd8e2');
    if (level) { R(g, 0, top - 1, 6, 2, '#fffaf0'); P(g, 1, top - 2, '#fffaf0'); P(g, 4, top - 2, '#fffaf0'); }
    else R(g, 0, 8, 6, 1, '#f4ecd8');
    R(g, 6, 3, 2, 1, '#dcecf0'); R(g, 7, 3, 1, 5, '#dcecf0'); R(g, 6, 7, 2, 1, '#dcecf0'); R(g, 6, 4, 1, 3, HOLE);
    R(g, 0, 10, 6, 1, '#bcd8e2');
  });
}
// A Brezn with `left` bites left (3 = whole).
const BREZN_ROWS = ['.##.#.##.', '#..###..#', '#...#...#', '#..#.#..#', '.###.###.'];
function makeBrezn(left) {
  return sprite(9, 5, 4, 4, g => {
    const keep = x => left >= 3 || (left === 2 && x < 6) || (left === 1 && x < 3);
    BREZN_ROWS.forEach((row, y) => { for (let x = 0; x < 9; x++) if (row[x] === '#' && keep(x)) P(g, x, y, y < 2 ? '#c87a3a' : '#a0582a'); });
    for (const [x, y] of [[1, 0], [4, 1], [7, 0], [2, 4], [6, 4]]) if (BREZN_ROWS[y][x] === '#' && keep(x)) P(g, x, y, '#fbf6ee');
  });
}
const MASS = [0, 1, 2, 3, 4].map(makeMass);
const BREZN = [0, 1, 2, 3].map(makeBrezn);

// ---- grown-ups in Tracht ---------------------------------------------------------
// Drawn pixel by pixel like Lina, half a head taller than the other children:
// men in Lederhosen and checked shirts (some with a hat, some with a beard),
// women in Dirndl with an apron, their hair braided round the head, in two
// plaits or in a bun.
const ADULT_LOOKS = [
  { kind: 'man', hair: '#5a3422', skin: '#f0c8a8', shirt: '#d8453f', pants: '#7a5232', sock: '#efe6d2', shoe: '#3a2a22', hat: '#4d5a40', beard: true },
  { kind: 'woman', hair: '#d9b060', skin: '#f7d4b6', blouse: '#fbf6ee', bodice: '#2f5f96', skirt: '#3b72b8', apron: '#f7b6cf', legs: '#f4f1ea', shoe: '#27242b', hairdo: 'crown' },
  { kind: 'man', hair: '#1d1418', skin: '#a8704a', shirt: '#4a7ac0', pants: '#5e3f28', sock: '#8d8781', shoe: '#27242b' },
  { kind: 'woman', hair: '#7a3a22', skin: '#f0c8a8', blouse: '#fbf6ee', bodice: '#8a2b3a', skirt: '#4f7a3a', apron: '#fbf6ee', legs: '#f0c8a8', shoe: '#5a3422', hairdo: 'braids', ribbon: '#e5484d' },
  { kind: 'man', hair: '#c89048', skin: '#f7d4b6', shirt: '#4f9a5a', pants: '#8a6a42', sock: '#efe6d2', shoe: '#3a2a22', hat: '#5a4a3a' },
  { kind: 'woman', hair: '#1d1418', skin: '#8a5a3c', blouse: '#fbf6ee', bodice: '#e2336f', skirt: '#5a2a4a', apron: '#a8d0f0', legs: '#8a5a3c', shoe: '#27242b', hairdo: 'bun' },
  { kind: 'man', hair: '#9a948e', skin: '#f0c8a8', shirt: '#d8453f', pants: '#5e3f28', sock: '#efe6d2', shoe: '#27242b', beard: true },
  { kind: 'woman', hair: '#b0502a', skin: '#f7d4b6', blouse: '#fbf6ee', bodice: '#3c7a4a', skirt: '#2f5f96', apron: '#ffe08a', legs: '#f4f1ea', shoe: '#27242b', hairdo: 'braids', ribbon: '#4a8ad0' },
];
const WAITRESS = { kind: 'woman', hair: '#5a3422', skin: '#f7d4b6', blouse: '#fbf6ee', bodice: '#2b2b30', skirt: '#8a2b3a', apron: '#fbf6ee', legs: '#f4f1ea', shoe: '#27242b', hairdo: 'bun' };
const HEART_SELLER = { kind: 'woman', hair: '#c89048', skin: '#f0c8a8', blouse: '#fbf6ee', bodice: '#e2336f', skirt: '#8a2b3a', apron: '#f7b6cf', legs: '#f4f1ea', shoe: '#27242b', hairdo: 'crown' };

function adultHead(g, c, o, blink, view) {
  const man = c.kind === 'man';
  if (view === 'up') {
    if (man) { R(g, 5, 4 + o, 10, 8, c.hair); R(g, 6, 11 + o, 8, 1, c.hairDk); R(g, 6, 12 + o, 8, 2, c.skin); P(g, 4, 8 + o, c.skin); P(g, 15, 8 + o, c.skin); }
    else {
      R(g, 5, 3 + o, 10, 11, c.hair); R(g, 4, 5 + o, 12, 7, c.hair);
      R(g, 7, 5 + o, 1, 8, c.hairDk); R(g, 12, 5 + o, 1, 8, c.hairDk); R(g, 9, 4 + o, 2, 2, c.hairHi);
      if (c.hairdo === 'bun') { disc(g, 10, 2 + o, 2, c.hair); P(g, 9, 1 + o, c.hairHi); }
      if (c.hairdo === 'crown') for (let x = 5; x < 15; x += 2) P(g, x, 5 + o, c.hairHi);
      if (c.hairdo === 'braids') for (const x of [7, 11]) {
        R(g, x, 14 + o, 2, 8, c.hair); for (let y = 15; y < 22; y += 2) P(g, x, y + o, c.hairHi); R(g, x, 22 + o, 2, 1, c.ribbon);
      }
    }
  } else if (view === 'right') {
    R(g, 8, 5 + o, 7, 9, c.skin); P(g, 15, 9 + o, c.skin); P(g, 15, 10 + o, c.skinSh);
    R(g, 5, 4 + o, 9, 2, c.hair); R(g, 5, 6 + o, 4, man ? 5 : 8, c.hair); P(g, 9, 6 + o, c.hair);
    P(g, 9, 9 + o, c.skinSh);
    if (blink) P(g, 12, 9 + o, c.eye); else R(g, 12, 8 + o, 1, 2, c.eye);
    P(g, 12, 11 + o, c.blush); P(g, 14, 12 + o, c.mouth);
    if (man && c.beard) { R(g, 9, 11 + o, 6, 3, c.hair); R(g, 12, 11 + o, 3, 1, c.hairDk); P(g, 14, 12 + o, c.mouth); }
    if (!man) {
      R(g, 5, 3 + o, 8, 1, c.hair);
      if (c.hairdo === 'bun') { disc(g, 5, 6 + o, 2, c.hair); P(g, 4, 5 + o, c.hairHi); }
      if (c.hairdo === 'crown') { for (let x = 5; x < 14; x += 2) P(g, x, 4 + o, c.hairHi); P(g, 11, 3 + o, '#e5484d'); }
      if (c.hairdo === 'braids') { R(g, 6, 13 + o, 2, 8, c.hair); for (let y = 14; y < 21; y += 2) P(g, 6, y + o, c.hairHi); R(g, 6, 21 + o, 2, 1, c.ribbon); }
    }
  } else {
    R(g, 5, 5 + o, 10, 9, c.skin); R(g, 14, 6 + o, 1, 7, c.skinSh);
    if (man) { R(g, 5, 4 + o, 10, 2, c.hair); R(g, 5, 6 + o, 1, 3, c.hair); R(g, 14, 6 + o, 1, 3, c.hair); R(g, 7, 4 + o, 3, 1, c.hairHi); }
    else {
      R(g, 5, 3 + o, 10, 3, c.hair); R(g, 4, 5 + o, 1, 6, c.hair); R(g, 15, 5 + o, 1, 6, c.hair);
      P(g, 5, 6 + o, c.hair); P(g, 14, 6 + o, c.hair); P(g, 9, 3 + o, c.hairDk); R(g, 6, 4 + o, 2, 1, c.hairHi);
      if (c.hairdo === 'crown') { for (let x = 5; x < 15; x += 2) P(g, x, 3 + o, c.hairHi); P(g, 13, 3 + o, '#e5484d'); P(g, 12, 3 + o, '#ffd35a'); }
      if (c.hairdo === 'bun') { disc(g, 10, 2 + o, 2, c.hair); P(g, 9, 1 + o, c.hairHi); }
      if (c.hairdo === 'braids') for (const x of [3, 15]) {
        R(g, x, 10 + o, 2, 10, c.hair); for (let y = 11; y < 20; y += 2) P(g, x + (x < 9 ? 0 : 1), y + o, c.hairHi); R(g, x, 20 + o, 2, 1, c.ribbon);
      }
    }
    if (blink) { P(g, 7, 9 + o, c.eye); P(g, 12, 9 + o, c.eye); } else { R(g, 7, 8 + o, 1, 2, c.eye); R(g, 12, 8 + o, 1, 2, c.eye); }
    P(g, 6, 10 + o, c.blush); P(g, 13, 10 + o, c.blush); P(g, 10, 10 + o, c.skinSh);
    R(g, 9, 12 + o, 2, 1, c.mouth);
    if (man && c.beard) { R(g, 6, 11 + o, 8, 3, c.hair); R(g, 5, 9 + o, 1, 3, c.hair); R(g, 14, 9 + o, 1, 3, c.hair); R(g, 8, 11 + o, 4, 1, c.hairDk); R(g, 9, 12 + o, 2, 1, c.mouth); }
  }
  if (man && c.hat) { // a Tyrolean hat with a tuft
    R(g, 4, 4 + o, 12, 1, c.hat); R(g, 6, 1 + o, 8, 3, c.hat); R(g, 6, 3 + o, 8, 1, shade(c.hat, -0.35)); R(g, 7, 1 + o, 3, 1, shade(c.hat, 0.2));
    const tx = view === 'right' ? 6 : 12;
    R(g, tx, o, 1, 2, '#efe6d2'); P(g, tx + 1, o, '#c9bca6');
  }
}

// One frame of a grown-up, 20x46, feet on the bottom row. f is the walking
// frame (0-3), dir 'down', 'up' or 'right'.
function adultBody(g, c, dir, f, blink) {
  const s = [0, 1, 0, -1][f], o = s ? 1 : 0, man = c.kind === 'man';
  const check = (x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P(g, x + i, y + j, (((x + i) >> 1) + ((y + j - o) >> 1)) & 1 ? c.shirt : WHITE); };
  if (dir === 'right') {
    for (const [x, back] of [[8 - 2 * s, true], [8 + 2 * s, false]]) {
      if (man) {
        R(g, x, 34, 3, 2, back ? c.skinSh : c.skin); R(g, x, 36, 3, 8, back ? shade(c.sock, -0.15) : c.sock);
        R(g, x, 44, 4, 2, back ? shade(c.shoe, -0.3) : c.shoe);
      } else { R(g, x + 1, 39, 2, 5, back ? shade(c.legs, -0.15) : c.legs); R(g, x + 1, 44, 3, 2, back ? shade(c.shoe, -0.3) : c.shoe); }
    }
    R(g, 9, 14 + o, 4, 1, c.skin);
    if (man) {
      R(g, 7, 28 + o, 6, 6 - o, c.pants); R(g, 7, 28 + o, 6, 1, c.pantsDk); P(g, 11, 30 + o, '#e8c65a');
      check(7, 15 + o, 6, 13); R(g, 11, 15 + o, 1, 13, c.pantsDk);
      check(9 - s, 15 + o, 2, 6); R(g, 9 - s, 21 + o, 2, 6, c.skin); R(g, 10 - s, 21 + o, 1, 6, c.skinSh);
    } else {
      for (let y = 26 + o; y < 39; y++) { const k = (y - 26) >> 2; R(g, 6 - k, y, 8 + k * 2, 1, c.skirt); R(g, 12 + k, y, 2, 1, c.apron); }
      R(g, 7, 18 + o, 6, 8, c.bodice); for (const y of [19, 21, 23]) P(g, 12, y + o, WHITE);
      R(g, 7, 15 + o, 6, 3, c.blouse); R(g, 11, 15 + o, 2, 2, c.skin);
      R(g, 8 - s, 15 + o, 3, 4, c.blouse); R(g, 9 - s, 19 + o, 2, 6, c.skin);
    }
    adultHead(g, c, o, blink, 'right');
    return;
  }
  const front = dir === 'down', lift = [s > 0 ? 1 : 0, s < 0 ? 1 : 0], a = front ? s : -s;
  R(g, 8, 14 + o, 4, 1, c.skin);
  if (man) {
    [6, 11].forEach((x, i) => {
      const l = lift[i];
      R(g, x, 34, 3, 2, c.skin); R(g, x, 36, 3, 8 - l, c.sock); R(g, x + 2, 36, 1, 8 - l, shade(c.sock, -0.15)); R(g, x, 44 - l, 3, 2, c.shoe);
    });
    R(g, 5, 28 + o, 10, 6 - o, c.pants); g.clearRect(9, 32, 2, 2); R(g, 5, 28 + o, 1, 6 - o, c.pantsDk); R(g, 14, 28 + o, 1, 6 - o, c.pantsDk);
    if (front) { R(g, 7, 28 + o, 6, 2, c.pantsDk); P(g, 7, 28 + o, '#e8c65a'); P(g, 12, 28 + o, '#e8c65a'); }
    check(5, 15 + o, 10, 13);
    R(g, 7, 15 + o, 1, 13, c.pantsDk); R(g, 12, 15 + o, 1, 13, c.pantsDk);
    if (front) { R(g, 7, 20 + o, 6, 2, c.pants); P(g, 9, 20 + o, '#e8c65a'); P(g, 10, 21 + o, '#e8c65a'); R(g, 9, 15 + o, 2, 1, c.skin); }
    else R(g, 7, 19 + o, 6, 1, c.pantsDk);
    for (const [x, ext] of [[3, a < 0 ? 1 : 0], [15, a > 0 ? 1 : 0]]) { check(x, 15 + o, 2, 6); R(g, x, 21 + o, 2, 6 + ext, c.skin); }
  } else {
    [7, 11].forEach((x, i) => { const l = lift[i]; R(g, x, 39, 2, 5 - l, c.legs); R(g, i ? x : x - 1, 44 - l, 3, 2, c.shoe); });
    for (let y = 26 + o; y < 39; y++) { const k = (y - 26) >> 2; R(g, 5 - k, y, 10 + k * 2, 1, c.skirt); }
    for (let x = 4; x < 16; x += 3) R(g, x, 31, 1, 8, shade(c.skirt, -0.15));
    if (front) {
      R(g, 7, 27 + o, 6, 10 - o, c.apron); R(g, 7, 36, 6, 1, shade(c.apron, -0.15));
      R(g, 5, 26 + o, 10, 1, shade(c.apron, -0.1)); R(g, 12, 26 + o, 3, 2, c.apron); P(g, 13, 27 + o, shade(c.apron, -0.25));
    } else { R(g, 8, 26 + o, 4, 2, c.apron); P(g, 7, 27 + o, c.apron); P(g, 12, 27 + o, c.apron); R(g, 9, 28 + o, 1, 3, c.apron); R(g, 11, 28 + o, 1, 3, c.apron); }
    R(g, 6, 18 + o, 8, 8, c.bodice); R(g, 13, 18 + o, 1, 8, shade(c.bodice, -0.25)); R(g, 6, 18 + o, 8, 1, shade(c.bodice, 0.3));
    if (front) for (let i = 0; i < 5; i++) P(g, 9 + (i & 1), 19 + o + i, WHITE);
    R(g, 5, 15 + o, 10, 3, c.blouse);
    if (front) { R(g, 8, 15 + o, 4, 2, c.skin); R(g, 8, 14 + o, 4, 1, '#3a2a3a'); P(g, 9, 15 + o, '#e5484d'); P(g, 10, 15 + o, '#e5484d'); }
    for (const [x, ext] of [[3, a < 0 ? 1 : 0], [15, a > 0 ? 1 : 0]]) { R(g, x < 9 ? 3 : 14, 15 + o, 3, 4, c.blouse); R(g, x, 19 + o, 2, 6 + ext, c.skin); }
  }
  adultHead(g, c, o, blink, front ? 'down' : 'up');
}

const _adultCache = new Map();
function adultSprites(look) {
  let S = _adultCache.get(look);
  if (S) return S;
  const c = Object.assign({ eye: '#1d130f', mouth: '#b85a52' }, look, {
    hairHi: shade(look.hair, 0.3), hairDk: shade(look.hair, -0.35), skinSh: shade(look.skin, -0.12), blush: shade(look.skin, -0.14),
    pantsDk: look.pants ? shade(look.pants, -0.25) : null,
  });
  const frame = (dir, f, blink) => sprite(20, 46, 10, 45, g => adultBody(g, c, dir, f, blink));
  S = { walk: {}, blink: {}, pitch: look.kind === 'man' ? 0.8 : 1.25 };
  for (const dir of ['down', 'up', 'right']) S.walk[dir] = [0, 1, 2, 3].map(f => frame(dir, f, false));
  S.walk.left = S.walk.right.map(mirrorSprite);
  S.blink.down = frame('down', 0, true); S.blink.right = frame('right', 0, true);
  S.blink.left = mirrorSprite(S.blink.right); S.blink.up = S.walk.up[0];
  _adultCache.set(look, S);
  return S;
}
function makeAdult(look, x, y, o = {}) {
  return makePerson(adultSprites(look), x, y, Object.assign({ h: 46, greet: p => Sound.hello(p.S.pitch) }, o));
}

// A child's balloon on a string, bobbing above them.
function balloon(col) {
  return (ctx, p, z) => {
    const hx = Math.round(p.x) + (p.dir === 'left' ? -6 : 6), hy = Math.round(p.y - z) - 9;
    const bx = hx + Math.round(Math.sin(G.t * 1.7 + p.x) * 2), by = hy - 32 + Math.round(Math.sin(G.t * 2.3 + p.y));
    line(ctx, hx, hy, bx, by + 5, 'rgba(250,250,250,0.75)');
    oval(ctx, bx, by, 4, 5, '#2a1c18'); oval(ctx, bx, by, 3, 4, col);
    ctx.fillStyle = shade(col, 0.55); ctx.fillRect(bx - 1, by - 2, 1, 2);
    ctx.fillStyle = col; ctx.fillRect(bx, by + 5, 1, 1);
  };
}

// ---- the gate at the top of the side street ---------------------------------------
function makeWiesnGate() {
  const W = 112, H = 74;
  return sprite(W, H, W / 2, H - 1, g => {
    spiralPole(g, 4, 8, 5, H - 8); spiralPole(g, W - 9, 8, 5, H - 8);
    R(g, 2, 14, W - 4, 22, '#6b4430');
    for (let y = 15; y < 35; y++) for (let x = 3; x < W - 3; x++) P(g, x, y, rauten(x, y));
    R(g, 10, 18, W - 20, 14, '#fbf0d8'); R(g, 10, 31, W - 20, 1, '#d8cbb0');
    lettering(g, 'WIESN', (W - textWidth('WIESN', 2)) >> 1, 20, '#8a2b3a', 2);
    lebHeart(g, 14, 21, '#f28bb0'); lebHeart(g, W - 23, 21, '#ffd35a');
    // a garland arching over the top, and pennants underneath
    for (let x = 4; x < W - 4; x++) {
      const y = 12 - Math.round(Math.sin((x - 4) / (W - 8) * Math.PI) * 8);
      R(g, x, y, 1, 3, x % 3 ? '#3c6934' : '#4f8a3a');
    }
    R(g, 6, 36, W - 12, 1, '#6c727a');
    for (let x = 8; x < W - 12; x += 6) poly(g, [[x, 37], [x + 5, 37], [x + 2.5, 42]], (x / 6 & 1) ? BLUE : WHITE);
  });
}

// The gate over the side street, where the Wiesn begins.
function buildWiesnGate(sc, add) {
  const J = OUT.junction, y = 120, s = makeWiesnGate();
  const bulbs = [];
  for (let x = 8; x < 104; x += 8) bulbs.push([x - 56, 12 - Math.round(Math.sin((x - 4) / 104 * Math.PI) * 8) - 73]);
  add(obj(J, y, s, {
    shadowFn: ctx => { drawShadow(ctx, J - 49, y, 5, 1); drawShadow(ctx, J + 50, y, 5, 1); },
    draw(ctx) {
      drawSprite(ctx, this.spr, this.x, this.y);
      bulbs.forEach(([bx, by], i) => { ctx.fillStyle = (i + Math.floor(G.t * 3)) % 3 ? '#fff0b0' : '#ffb04a'; ctx.fillRect(this.x + bx, this.y + by, 1, 1); });
    },
    glowFn() { for (let i = 0; i < bulbs.length; i += 2) glow(this.x + bulbs[i][0], this.y + bulbs[i][1], 9, '255,210,120', 0.18); },
  }));
  sc.doors.push({ x: J - 64, y: 108, w: 128, h: 16, to: 'wiesn', need: 'up', at: { x: WIESN.W / 2, y: WIESN.H - 16, dir: 'up' } });
}

// ---- the beer tent ------------------------------------------------------------------
function makeTent() {
  const W = 200, H = 112;
  return sprite(W, H, W / 2, H - 1, g => {
    const r = rng(1810);
    // a blue and white striped canvas roof with a scalloped edge
    for (let y = 30; y < 54; y++) {
      const k = y - 30;
      for (let x = 24 - k; x < 176 + k; x++) P(g, x, y, shade(((x + 400) >> 3) & 1 ? BLUE : WHITE, -k * 0.006));
    }
    for (let x = 0; x < W; x++) {
      const col = (x >> 3) & 1 ? BLUE : WHITE;
      R(g, x, 54, 1, 4, col); if ((x & 7) > 1 && (x & 7) < 6) P(g, x, 58, col);
    }
    // the wooden front
    R(g, 4, 59, W - 8, H - 59, '#b07a4a');
    for (let x = 4; x < W - 4; x += 6) R(g, x, 59, 1, H - 59, '#8a5a38');
    for (let i = 0; i < 90; i++) P(g, 4 + (r() * (W - 8) | 0), 60 + (r() * (H - 60) | 0), r() < 0.5 ? '#c8955a' : '#9a6a40');
    R(g, 4, 59, W - 8, 2, 'rgba(40,20,10,0.3)'); R(g, 4, H - 4, W - 8, 4, '#6f4a2a');
    // two little towers with flags
    for (const tx of [2, W - 24]) {
      R(g, tx, 24, 22, H - 24, '#f4ead6'); R(g, tx, 24, 22, 2, '#d8cbb0');
      for (const y of [44, 76]) R(g, tx, y, 22, 2, '#6b4430');
      line(g, tx, 46, tx + 21, 75, '#6b4430'); line(g, tx + 21, 46, tx, 75, '#6b4430');
      R(g, tx + 6, 29, 10, 12, '#6b4430'); R(g, tx + 7, 30, 8, 10, '#ffd98a'); R(g, tx + 10, 30, 2, 10, '#6b4430');
      R(g, tx, H - 6, 22, 6, '#8d8781');
      poly(g, [[tx - 3, 25], [tx + 11, 5], [tx + 25, 25]], BLUE); poly(g, [[tx - 3, 25], [tx + 11, 5], [tx + 11, 25]], shade(BLUE, 0.2));
      R(g, tx + 11, 0, 1, 6, '#6c727a');
      for (let y = 0; y < 4; y++) for (let x = 0; x < 7; x++) P(g, tx + 12 + x, y, (x + y) & 1 ? BLUE : WHITE);
    }
    // the gable over the door, painted with diamonds, and a Maß on a round sign
    for (let y = 10; y < 59; y++) {
      const hw = (y - 10) * 36 / 48;
      for (let x = Math.round(100 - hw); x <= Math.round(100 + hw); x++) P(g, x, y, rauten(x, y));
    }
    line(g, 100, 9, 63, 58, '#6b4430', 2); line(g, 100, 9, 137, 58, '#6b4430', 2);
    disc(g, 100, 36, 9, '#6b4430'); disc(g, 100, 36, 8, '#fbf6ee');
    R(g, 96, 32, 6, 9, '#f0a82a'); R(g, 97, 32, 1, 9, '#ffd060'); R(g, 96, 30, 6, 2, '#fffaf0'); P(g, 97, 29, '#fffaf0');
    R(g, 102, 33, 2, 1, '#bcd8e2'); R(g, 103, 33, 1, 5, '#bcd8e2'); R(g, 102, 37, 2, 1, '#bcd8e2');
    // banner
    R(g, 58, 60, 84, 14, '#6b4430'); R(g, 59, 61, 82, 12, '#fbf0d8');
    lettering(g, 'FESTZELT', 100 - (textWidth('FESTZELT', 2) >> 1), 62, '#8a2b3a', 2);
    // the door, wide open: warm light, lanterns and people inside
    R(g, 82, 76, 36, H - 76, '#6b4430'); R(g, 84, 78, 32, H - 78, '#3a2418'); R(g, 84, 78, 32, 3, '#2a1a12');
    for (let x = 86; x < 116; x += 4) P(g, x, 81 + ((x >> 2) & 1), '#ffe08a');
    for (const [px, col] of [[89, '#5a3a2a'], [98, '#4a3024'], [108, '#5a3a2a']]) { disc(g, px, 92, 2, col); R(g, px - 2, 95, 5, 7, col); }
    R(g, 84, 101, 32, 3, '#8a5a38'); R(g, 84, 101, 32, 1, '#b07a4a');
    R(g, 76, 76, 6, H - 76, '#3c7a4a'); R(g, 118, 76, 6, H - 76, '#3c7a4a');
    R(g, 77, 80, 4, 12, '#4f8a5a'); R(g, 119, 80, 4, 12, '#4f8a5a');
    // windows with flower boxes
    for (const wx of [30, 54, 130, 154]) {
      R(g, wx, 72, 16, 16, '#6b4430'); R(g, wx + 1, 73, 14, 14, '#ffd98a'); R(g, wx + 1, 73, 14, 5, '#ffe9b8');
      R(g, wx + 7, 73, 2, 14, '#6b4430'); R(g, wx + 1, 79, 14, 1, '#6b4430');
      R(g, wx - 1, 88, 18, 4, '#8a5a38'); R(g, wx - 1, 88, 18, 1, '#b07a4a');
      for (let i = 0; i < 8; i++) { P(g, wx + i * 2, 87, '#3c6934'); P(g, wx + 1 + i * 2, 86, pick(r, ['#e5484d', '#ff6f6f', '#e5484d', '#fbf6ee'])); }
    }
    // a garland under the roof
    for (let x = 26; x < 174; x++) R(g, x, 59 + Math.round(Math.abs(Math.sin(x / 12)) * 2), 1, 2, x % 3 ? '#3c6934' : '#4f8a3a');
  });
}

// ---- the gingerbread heart stand ----------------------------------------------------
function makeHeartStand(layer) {
  const W = 76, H = 72;
  if (layer === 'back') {
    return sprite(W, H, W / 2, H - 1, g => {
      R(g, 6, 26, 64, 24, '#5a3a2a'); R(g, 6, 26, 64, 2, '#3e281c');
      for (let i = 0; i < 6; i++) lebHeart(g, 9 + i * 10, 34 + (i & 1) * 4, HEART_ICING[i % HEART_ICING.length]);
    }, { noOutline: true });
  }
  return sprite(W, H, W / 2, H - 1, g => {
    const wood = '#8a5a38', woodL = '#b07a4a', pink = '#f28bb0', pinkD = '#d9668e', cream = '#fbf0d8';
    R(g, 2, 22, 4, H - 22, woodL); R(g, W - 6, 22, 4, H - 22, wood);
    R(g, 0, 12, W, 4, cream); R(g, 0, 15, W, 1, '#c9c2b8');
    for (let x = 0; x < W; x++) {
      const col = (x >> 2) & 1 ? cream : pink;
      R(g, x, 16, 1, 9, col); if ((x & 3) === 1 || (x & 3) === 2) P(g, x, 25, col);
    }
    R(g, 14, 0, 48, 12, pinkD); R(g, 15, 1, 46, 10, cream);
    lettering(g, 'LEBKUCHEN', 38 - (textWidth('LEBKUCHEN') >> 1), 4, '#8a4a24');
    // hearts dangling from the awning
    for (let i = 0; i < 5; i++) {
      const x = 10 + i * 12, y = 29 + (i & 1) * 2;
      R(g, x + 4, 26, 1, y - 26, '#fbf6ee'); lebHeart(g, x, y, HEART_ICING[(i + 2) % 5]);
    }
    // the counter and big hearts hung on the front
    R(g, 4, 48, W - 8, 3, '#d0a878'); R(g, 4, 48, W - 8, 1, '#e4c296'); R(g, 4, 51, W - 8, 1, wood);
    R(g, 6, 52, W - 12, H - 52, '#c8955a');
    for (let x = 6; x < W - 6; x += 7) R(g, x, 52, 1, H - 52, '#a8744a');
    for (let i = 0; i < 4; i++) { const x = 9 + i * 15, y = 56 + (i & 1) * 2; R(g, x + 6, 53, 1, y - 53, '#fbf6ee'); lebHeart(g, x, y, HEART_ICING[i], true); }
  });
}

// Buy a heart: the seller hands one over, it flies to Lina and she wears it.
function heartStand(x, y) {
  const back = makeHeartStand('back'), seller = adultSprites(HEART_SELLER);
  return obj(x, y, makeHeartStand('front'), {
    shadowFn: ctx => { ctx.fillStyle = 'rgba(34,22,38,0.22)'; ctx.fillRect(x - 37, y - 1, 76, 4); },
    solid: { x: x - 37, y: y - 16, w: 74, h: 16 }, iy: y + 4, top: y - 30, fly: null, hopT: 0,
    update(dt) {
      if (this.hopT > 0) this.hopT -= dt;
      const f = this.fly;
      if (!f) return;
      f.t += dt;
      const k = Math.min(1, f.t / 0.8), sx = this.x, sy = this.y - 34, tx = Pl.x, ty = Pl.y - 18;
      f.p.x = sx + (tx - sx) * k - 4; f.p.y = sy + (ty - sy) * k - Math.sin(Math.PI * k) * 26 - 4;
      if (k >= 1) {
        f.p.life = 0; this.fly = null;
        Pl.heart = { col: f.col };
        Sound.yay(); burst(Pl.x, Pl.y - 22, 'heart', 5); burst(Pl.x, Pl.y - 22, 'confetti', 14);
      }
    },
    draw(ctx) {
      drawSprite(ctx, back, this.x, this.y);
      const blink = Math.sin(G.t * 0.9) > 0.97;
      drawSprite(ctx, blink ? seller.blink.down : seller.walk.down[0], this.x - 2, this.y - 2 - (this.hopT > 0 ? 2 : 0));
      drawSprite(ctx, this.spr, this.x, this.y);
    },
    interact: o => {
      if (o.fly) return;
      const col = pick(Math.random, HEART_ICING.filter(c => !Pl.heart || c !== Pl.heart.col));
      const p = { x: o.x, y: o.y - 34, vx: 0, vy: 0, g: 0, life: 9, max: 9, kind: 'lebheart', draw: (ctx, q) => lebHeart(ctx, Math.round(q.x), Math.round(q.y), col) };
      G.particles.push(p);
      o.fly = { t: 0, col, p }; o.hopT = 0.3;
      Sound.coin();
    },
  });
}

// ---- beer tables and the waitress ---------------------------------------------------
// Everything at a table sways together now and then (schunkeln).
function schunkel() { return G.t % 26 < 7 ? Math.round(Math.sin(G.t * 3.2) * 1.4) : 0; }

function makeBeerTable(L) {
  return sprite(L, 29, L / 2, 28, g => {
    // a blue and white checked cloth over the top, hanging down in front
    for (let y = 0; y < 5; y++) for (let x = 0; x < L; x++) P(g, x, y, ((x >> 2) + (y >> 1)) & 1 ? BLUE : WHITE);
    for (let y = 5; y < 11; y++) for (let x = 0; x < L; x++) P(g, x, y, ((x >> 2) + ((y - 5) / 3 | 0)) & 1 ? shade(BLUE, -0.15) : shade(WHITE, -0.1));
    R(g, 0, 5, L, 1, 'rgba(40,30,50,0.25)'); R(g, 0, 10, L, 1, 'rgba(40,30,50,0.2)');
    for (const x of [4, L - 6]) R(g, x, 11, 2, 7, '#6c727a');
    // the bench in front
    R(g, 0, 19, L, 2, '#d0a878'); R(g, 0, 19, L, 1, '#e4c296'); R(g, 0, 21, L, 1, '#8a5a38');
    for (const x of [3, L / 2 - 1, L - 5]) R(g, x, 22, 2, 7, '#8a5a38');
  });
}

// A beer table with benches either side (y is the front bench's feet).
// north/south: who sits on the four seats of the back and front bench
// (ADULT_LOOKS, or null). Lina sits down on a free seat on the back bench,
// facing us, and the waitress brings her a Maß and a Brezn. Ⓐ: a sip, a bite.
function beerTable(tx, ty, north, south, waitress) {
  const L = 80, SEATS = [-27, -9, 9, 27];
  const benchN = sprite(L, 5, L / 2, 4, g => {
    R(g, 0, 0, L, 2, '#d0a878'); R(g, 0, 0, L, 1, '#e4c296'); R(g, 0, 2, L, 1, '#8a5a38');
    for (const x of [3, L - 5]) R(g, x, 3, 2, 2, '#8a5a38');
  });
  const sitter = look => look && { S: adultSprites(look), lift: 0, next: 2 + Math.random() * 10, level: 1 + (Math.random() * 4 | 0) };
  // nobody sits opposite a free seat, so we can see what Lina gets
  const N = north.map(sitter), S = south.map((look, k) => north[k] ? sitter(look) : null);
  const here = t => Pl.sit && Pl.sit.obj === t;
  return {
    x: tx, y: ty, iy: ty - 20, top: ty - 62, items: [], lina: null, act: null, orderT: 0,
    solid: { x: tx - L / 2 - 1, y: ty - 33, w: L + 2, h: 33 },
    freeSeat() {
      let best = -1, bd = 1e9;
      N.forEach((who, k) => { const d = Math.abs(tx + SEATS[k] - Pl.x); if (!who && d < bd) { bd = d; best = k; } });
      return best;
    },
    get ix() { return tx + SEATS[Math.max(0, this.freeSeat())]; },
    seatX(k) { return tx + SEATS[k]; },
    sitAt(p) { const k = this.freeSeat(); this.lina = k; p.x = tx + SEATS[k]; p.y = ty - 30; this.orderT = 0; },
    standY: ty - 35,
    onStand() { this.lina = null; this.act = null; },
    serve(k) {
      this.items[k] = { mug: 4, brezn: 3, turn: 0, fresh: true };
      Sound.clink(); burst(tx + SEATS[k], ty - 34, 'heart', 3);
    },
    // Ⓐ at the table: a sip of the Maß, then a bite of the Brezn, and so on
    sitAct() {
      const it = this.items[this.lina];
      if (this.act) return;
      if (!it || (!it.mug && !it.brezn)) { this.orderT = 1; Sound.hello(1.1); burst(Pl.x, Pl.y - 50, 'note', 1); return; }
      const sip = it.mug > 0 && (it.brezn === 0 || it.turn % 2 === 0);
      it.turn++;
      this.act = { kind: sip ? 'sip' : 'bite', t: 0.7 };
      if (sip) {
        if (it.fresh) { // Prost! everyone at the table raises their glass
          it.fresh = false;
          for (const s of [...N, ...S]) if (s) s.lift = 1.2;
          Sound.clink(); burst(Pl.x, Pl.y - 56, 'star', 4);
        }
        it.mug--; Pl.foam = 5; Sound.gulp();
      } else { it.brezn--; Sound.crunch(); burst(Pl.x, Pl.y - 38, 'crumb', 6); }
      if (!it.mug && !it.brezn) { it.done = 1.6; Sound.yum(); burst(Pl.x, Pl.y - 50, 'heart', 4); }
    },
    update(dt) {
      for (const s of [...N, ...S]) {
        if (!s) continue;
        if (s.lift > 0) s.lift -= dt;
        else if ((s.next -= dt) <= 0) { s.lift = 1; s.next = 5 + Math.random() * 10; }
      }
      if (this.act && (this.act.t -= dt) <= 0) this.act = null;
      this.items.forEach((it, k) => { if (it && it.done !== undefined && (it.done -= dt) <= 0) this.items[k] = null; });
      if (here(this) && !this.items[this.lina]) {
        this.orderT += dt;
        if (this.orderT > 1) waitress.order(this, this.lina);
      }
    },
    draw(ctx) {
      const X = Math.round(this.x), Y = Math.round(this.y), sw = schunkel();
      drawSprite(ctx, benchN, X, Y - 27);
      // the back bench, facing us
      N.forEach((who, k) => {
        const sx = X + SEATS[k] + sw;
        if (who) drawSpriteRows(ctx, who.S.walk.down[0], sx, Y - 13, 0, 31);
        else if (this.lina === k && here(this)) drawLinaSit(ctx, sx, Y - 30);
      });
      drawSprite(ctx, TABLE, X, Y);
      // on the table
      N.forEach((who, k) => {
        const sx = X + SEATS[k] + sw;
        if (who && who.lift > 0) drawSprite(ctx, MASS[who.level], sx + 2, Y - 38);
        else if (who) drawSprite(ctx, MASS[who.level], X + SEATS[k] + 6, Y - 24);
        const it = this.items[k];
        if (!it) return;
        const act = this.lina === k && here(this) ? this.act : null;
        if (act && act.kind === 'bite') drawSprite(ctx, BREZN[it.brezn], sx, Y - 36);
        else drawSprite(ctx, BREZN[it.brezn], X + SEATS[k] - 6, Y - 24);
        if (act && act.kind === 'sip') drawSprite(ctx, MASS[it.mug], sx + 2, Y - 33);
        else drawSprite(ctx, MASS[it.mug], X + SEATS[k] + 7, Y - 24);
      });
      // the front bench, backs to us
      S.forEach((who, k) => {
        if (!who) return;
        const sx = X + SEATS[k] + sw;
        drawSpriteRows(ctx, who.S.walk.up[0], sx, Y + 9, 0, 31);
        if (who.lift > 0) drawSprite(ctx, MASS[who.level], sx + 8, Y - 30);
      });
    },
    interact: o => startSit(o),
  };
}
const TABLE = makeBeerTable(80);

// The waitress: waits at the tent door, and when Lina sits down at a table
// she carries a Maß and a Brezn over to her, along the aisle.
function makeWaitress(home) {
  const S = adultSprites(WAITRESS);
  return {
    x: home.x, y: home.y, S, dir: 'down', dist: 0, moving: false, state: 'home', path: [], jobs: [], job: null, carry: false, t: 0,
    shadow: [7, 2], blink: 0, blinkT: 2, happy: 0,
    get top() { return this.y - 46; },
    order(table, seat) {
      const same = j => j && j.table === table && j.seat === seat;
      if (!same(this.job) && !this.jobs.some(same)) this.jobs.push({ table, seat });
    },
    route(job) { const y = job.table.y + 9; return [[home.x, home.y + 8], [home.x, y], [job.table.seatX(job.seat), y]]; },
    update(dt) {
      this.blinkT -= dt;
      if (this.blinkT < 0) { this.blink = 0.13; this.blinkT = 2 + Math.random() * 3; }
      if (this.blink > 0) this.blink -= dt;
      if (this.happy > 0) this.happy -= dt;
      this.moving = false;
      if (this.state === 'home') {
        this.dir = 'down';
        if (this.jobs.length) { this.job = this.jobs.shift(); this.path = this.route(this.job); this.state = 'go'; this.carry = true; }
        return;
      }
      if (this.state === 'serve') {
        if ((this.t -= dt) > 0) return;
        this.job.table.serve(this.job.seat);
        this.carry = false;
        this.path = this.route(this.job).reverse().slice(1).concat([[home.x, home.y]]);
        this.job = null; this.state = 'back';
        return;
      }
      const [px, py] = this.path[0], dx = px - this.x, dy = py - this.y, d = Math.hypot(dx, dy);
      if (d < 1) {
        this.x = px; this.y = py; this.path.shift();
        if (!this.path.length) {
          if (this.state === 'go') { this.state = 'serve'; this.t = 0.6; this.dir = 'up'; }
          else this.state = 'home';
        }
        return;
      }
      const step = Math.min(d, 46 * dt);
      this.x += dx / d * step; this.y += dy / d * step; this.dist += step; this.moving = true;
      this.dir = faceTo(this, px, py);
    },
    draw(ctx) {
      const s = this.moving ? S.walk[this.dir][Math.floor(this.dist / 7) % 4] : this.blink > 0 ? S.blink[this.dir] : S.walk[this.dir][0];
      const bob = this.moving && Math.floor(this.dist / 7) % 2 ? 1 : 0, X = Math.round(this.x), Y = Math.round(this.y);
      if (this.carry && this.dir === 'up') { drawSprite(ctx, MASS[4], X - 8, Y - 15 + bob); drawSprite(ctx, BREZN[3], X + 8, Y - 18 + bob); }
      drawSprite(ctx, s, this.x, this.y);
      if (!this.carry || this.dir === 'up') return;
      if (this.dir === 'down') { drawSprite(ctx, MASS[4], X - 8, Y - 15 + bob); drawSprite(ctx, BREZN[3], X + 8, Y - 18 + bob); }
      else { const f = this.dir === 'right' ? 1 : -1; drawSprite(ctx, MASS[4], X + f * 6, Y - 15 + bob); drawSprite(ctx, BREZN[3], X + f * 4, Y - 26 + bob); }
    },
    interact(o) { o.happy = 1; Sound.hello(1.3); burst(o.x, o.top, 'heart', 3); },
  };
}

// ---- the carousel -------------------------------------------------------------------
function makeHorse(col, mane, saddle) {
  return sprite(22, 16, 10, 4, g => {
    const d = shade(col, -0.18);
    line(g, 6, 10, 3, 14, d, 2); R(g, 2, 15, 2, 1, '#e8c65a');
    oval(g, 10, 8, 7, 3, col); R(g, 4, 10, 12, 1, d);
    poly(g, [[14, 7], [16, 2], [19, 2], [18, 9]], col);
    R(g, 16, 1, 4, 3, col); R(g, 19, 2, 3, 2, col); P(g, 21, 3, d); P(g, 18, 2, '#2a1c18'); P(g, 17, 0, col);
    line(g, 15, 2, 13, 7, mane, 2); P(g, 16, 1, mane); line(g, 4, 6, 1, 10, mane, 2);
    line(g, 15, 10, 18, 12, col, 2); line(g, 18, 12, 17, 14, col); P(g, 17, 15, '#e8c65a');
    R(g, 7, 4, 6, 2, saddle); R(g, 8, 6, 4, 4, shade(saddle, -0.2)); R(g, 8, 9, 4, 1, '#e8c65a');
  });
}

// The round platform: wooden rings on top, a red skirt with mirrors round the side.
function makeCarouselBase() {
  return sprite(96, 36, 48, 20, g => {
    const c = 48, cy = 15, rx = 46, ry = 14;
    for (let x = 2; x <= 94; x++) {
      const t = (x - c) / rx;
      if (Math.abs(t) > 1) continue;
      const ye = cy + Math.round(ry * Math.sqrt(1 - t * t));
      R(g, x, ye, 1, 6, '#c0392b'); P(g, x, ye + 5, '#e8c65a');
      if (x % 8 === 4) R(g, x, ye + 2, 1, 2, '#cfeaf8');
    }
    for (let y = 0; y < 32; y++) for (let x = 0; x < 96; x++) {
      const d = Math.hypot((x - c) / rx, (y - cy) / ry);
      if (d <= 1) P(g, x, y, d > 0.93 ? '#e8c65a' : d < 0.18 ? '#8d8781' : (Math.floor(d * 7) & 1) ? '#c8955a' : '#b98a5a');
    }
  });
}
function makeCarouselColumn() {
  return sprite(14, 54, 7, 53, g => {
    R(g, 2, 0, 10, 54, '#c0392b'); R(g, 2, 0, 2, 54, '#d8584a');
    for (let y = 4; y < 50; y += 12) { R(g, 2, y - 1, 10, 1, '#e8c65a'); R(g, 4, y + 1, 6, 8, '#cfeaf8'); R(g, 4, y + 1, 2, 3, '#ffffff'); }
  });
}
// The striped roof: a cone down to the rim, with a scalloped valance.
// Rim centre 56 above the ground, rx 52, ry 14.
function makeCarouselRoof() {
  return sprite(108, 64, 54, 96, g => {
    const cx = 54, rimY = 40, peak = 8, rx = 52, ry = 14, cols = ['#e5484d', '#fbf6ee'], val = ['#ffd35a', '#4a8ad0'];
    for (let y = peak; y <= rimY + ry; y++) for (let x = 0; x < 108; x++) {
      const dx = x - cx;
      let hw;
      if (y <= rimY) hw = rx * (y - peak) / (rimY - peak);
      else { const k = (y - rimY) / ry; hw = rx * Math.sqrt(Math.max(0, 1 - k * k)); }
      if (Math.abs(dx) > hw) continue;
      const t = y <= rimY ? (hw ? dx / hw : 0) : dx / rx;
      const seg = Math.floor((Math.asin(Math.max(-1, Math.min(1, t))) / Math.PI + 0.5) * 12);
      P(g, x, y, shade(cols[seg & 1], t > 0 ? -t * 0.22 : -t * 0.06));
    }
    for (let x = 2; x <= 106; x++) {
      const t = (x - cx) / rx, ye = rimY + Math.round(ry * Math.sqrt(Math.max(0, 1 - t * t)));
      const col = val[Math.floor((Math.asin(Math.max(-1, Math.min(1, t))) / Math.PI + 0.5) * 12) & 1];
      R(g, x, ye, 1, 6, shade(col, t > 0 ? -t * 0.2 : 0)); P(g, x, ye, '#e8c65a');
      if (x % 6 > 0 && x % 6 < 5) P(g, x, ye + 6, col);
      if (x % 6 > 1 && x % 6 < 4) P(g, x, ye + 7, col);
    }
    R(g, cx - 1, 3, 3, 6, '#e8c65a'); R(g, cx, 0, 1, 4, '#6c727a'); R(g, cx + 1, 0, 5, 3, '#e5484d');
  });
}

// Six horses go round; other children ride some of them. Now and then it
// goes round on its own. Ⓐ: Lina gets on a free horse and it plays her a
// tune (if it's already turning, she gets on at the next stop).
function carousel(cx, cy, riders) {
  const base = makeCarouselBase(), column = makeCarouselColumn(), roof = makeCarouselRoof();
  const looks = [['#f4efe6', '#d9a55a', '#e5484d'], ['#f7c6d6', '#b0502a', '#4a8ad0'], ['#bfe0f5', '#8a6ad8', '#ffd35a'],
    ['#f6e2b0', '#e5484d', '#4fb35a'], ['#e0d4f0', '#5a3422', '#f28bb0'], ['#f4efe6', '#4a8ad0', '#c86ad8']];
  const horses = looks.map(([c, m, s], i) => { const h = makeHorse(c, m, s); return { spr: { right: h, left: mirrorSprite(h) }, rider: riders[i] || null }; });
  const bulbs = [];
  for (let x = -48; x <= 48; x += 8) bulbs.push([x, -56 + Math.round(14 * Math.sqrt(1 - (x / 52) ** 2)) + 3]);
  return {
    x: cx, y: cy + 14, cy, rot: 0.4, w: 0, state: 'stop', t: 0, dur: 0, lina: null, queued: false,
    ix: cx, iy: cy + 20, top: cy + 10,
    solid: { x: cx - 46, y: cy - 16, w: 92, h: 30 },
    start(dur) { this.state = 'run'; this.t = 0; this.dur = dur; },
    board() {
      let best = -1, bs = -2;
      horses.forEach((h, i) => { const s = Math.sin(this.rot + i * TAU / 6); if (!h.rider && s > bs) { bs = s; best = i; } });
      this.lina = best; Pl.ride = { obj: this }; Pl.vx = Pl.vy = 0;
      Sound.boing(); burst(this.x, cy - 30, 'star', 3);
      this.start(Math.max(9, Sound.organ()));
    },
    getOff() {
      const a = this.rot + this.lina * TAU / 6;
      this.lina = null; Pl.ride = null;
      Pl.x = this.x + Math.max(-34, Math.min(34, Math.cos(a) * 32)); Pl.y = this.y + 6; Pl.dir = 'down';
      if (blocked(G.scene, Pl.x, Pl.y)) Pl.y += 8;
      Pl.jump = 0.42; Sound.boing(); burst(Pl.x, Pl.y - 30, 'star', 4);
    },
    update(dt) {
      this.t += dt;
      if (this.state === 'run') {
        const going = this.t < this.dur;
        this.w += ((going ? 1.25 : 0) - this.w) * Math.min(1, dt * (going ? 0.9 : 1.3));
        if (!going && this.w < 0.04) { this.w = 0; this.state = 'stop'; this.t = 0; if (this.lina !== null) this.getOff(); }
      } else if (this.queued) {
        this.queued = false;
        if (!Pl.ride && !Pl.sit && !Pl.riding && Math.hypot(Pl.x - this.x, Pl.y - this.y) < 60) this.board();
      } else if (this.t > 8) this.start(7);
      this.rot -= this.w * dt;
    },
    drawHorse(ctx, e) {
      const face = e.s > 0 ? 'right' : 'left', f = face === 'right' ? 1 : -1;
      const bob = Math.round(Math.sin(this.rot * 3 + e.i * 2.1) * 2.5 * Math.min(1, this.w / 1.25));
      const hx = Math.round(e.x), sy = Math.round(e.y) - 12 - bob, rimY = Math.round(cy - 56 + e.s * 14);
      ctx.fillStyle = '#e8c65a'; ctx.fillRect(hx + 4 * f, rimY, 1, Math.round(e.y) - rimY);
      ctx.fillStyle = '#b08a3a'; ctx.fillRect(hx + 4 * f + f, rimY, 1, Math.round(e.y) - rimY);
      drawSprite(ctx, e.h.spr[face], hx, sy);
      if (this.lina === e.i) {
        drawSprite(ctx, face === 'right' ? SPR.horseSit : SPR.horseSitLeft, hx - f, sy + 1);
        drawHeartSide(ctx, snapPx(hx - f) + (f > 0 ? 3 : -5), snapPx(sy + 1) - 22, f < 0);
      } else if (e.h.rider) drawSprite(ctx, e.h.rider.ride[face], hx - f, sy + 1);
    },
    draw(ctx) {
      const X = this.x;
      drawSprite(ctx, base, X, cy);
      const list = horses.map((h, i) => { const a = this.rot + i * TAU / 6, s = Math.sin(a); return { h, i, s, x: X + Math.cos(a) * 32, y: cy - 5 + s * 10 }; })
        .sort((p, q) => p.y - q.y);
      for (const e of list) if (e.s < 0) this.drawHorse(ctx, e);
      drawSprite(ctx, column, X, cy - 5);
      for (const e of list) if (e.s >= 0) this.drawHorse(ctx, e);
      drawSprite(ctx, roof, X, cy);
      const run = this.state === 'run';
      bulbs.forEach(([bx, by], i) => {
        ctx.fillStyle = run ? ((i + Math.floor(G.t * 6)) % 3 ? '#fff0b0' : '#ff8a4a') : '#fff0b0';
        ctx.fillRect(X + bx, cy + by, 1, 1);
      });
    },
    glowFn() { for (let i = 0; i < bulbs.length; i += 2) glow(this.x + bulbs[i][0], cy + bulbs[i][1], 8, '255,210,120', this.state === 'run' ? 0.22 : 0.12); },
    interact: o => {
      if (o.state === 'stop') o.board();
      else { o.queued = true; Sound.pop(); burst(o.x, cy - 30, 'note', 2); }
    },
    rideUpdate() { if (Input.pressed('interact') || Input.pressed('bell')) { Sound.neigh(); burst(Pl.x, Pl.y - 40, 'heart', 2); } },
    focus() { return [this.x, cy - 30]; },
  };
}

// ---- the Ferris wheel ---------------------------------------------------------------
// A gondola hanging from its pivot at the top middle. 'back' is the roof,
// the posts and the open window; 'front' the lower half in front of whoever
// sits inside.
function makeGondola(col, layer) {
  return sprite(20, 26, 10, 0, g => {
    if (layer === 'back') {
      R(g, 9, 0, 2, 3, '#6c727a');
      R(g, 3, 2, 14, 1, col); R(g, 1, 3, 18, 3, col); R(g, 1, 3, 18, 1, shade(col, 0.35)); R(g, 1, 5, 18, 1, shade(col, -0.25));
      R(g, 2, 6, 1, 13, '#8d8781'); R(g, 17, 6, 1, 13, '#8d8781');
    } else {
      R(g, 1, 19, 18, 6, col); R(g, 1, 19, 18, 1, shade(col, 0.35)); R(g, 1, 24, 18, 1, shade(col, -0.3)); R(g, 3, 25, 14, 1, shade(col, -0.3));
      for (let x = 4; x < 17; x += 4) P(g, x, 21, '#fbf6ee');
    }
  });
}

// The wheel turns slowly all the time. Ⓐ at the steps: Lina gets into the
// gondola at the bottom and goes round once; at the very top she cheers.
function ferrisWheel(hx, hy, riders) {
  const Rw = 58, N = 8, base = hy + 88;
  const rim = sprite(2 * Rw + 8, 2 * Rw + 8, Rw + 4, Rw + 4, g => {
    const c = Rw + 4;
    for (let y = 0; y < 2 * Rw + 8; y++) for (let x = 0; x < 2 * Rw + 8; x++) {
      const d = Math.hypot(x - c, y - c);
      if (Math.abs(d - Rw) < 1) P(g, x, y, '#f4f1ea');
      else if (Math.abs(d - (Rw - 5)) < 0.75 || Math.abs(d - 22) < 0.7) P(g, x, y, '#d8d4cc');
    }
  });
  const legs = sprite(100, 96, 50, 6, g => {
    const st = '#8d8781', hi = '#b0aaa2';
    for (const fx of [10, 90]) { line(g, 50, 6, fx, 94, st, 3); line(g, 50, 5, fx - 1, 93, hi); }
    R(g, 26, 60, 49, 2, st); R(g, 36, 36, 29, 2, st); line(g, 37, 37, 74, 60, st); line(g, 63, 37, 27, 60, st);
    R(g, 28, 89, 44, 2, '#d0a878'); R(g, 28, 89, 44, 1, '#e4c296'); R(g, 28, 91, 44, 4, '#8a5a38');
    for (let x = 30; x < 72; x += 6) R(g, x, 91, 1, 4, '#6f4a2a');
    disc(g, 50, 6, 6, '#e5484d'); disc(g, 50, 6, 3, '#e8c65a'); P(g, 49, 5, '#fff0b0');
  });
  const cols = ['#e5484d', '#4a8ad0', '#ffd35a', '#4fb35a', '#f28bb0', '#ff9a4a', '#6fc2a8', '#c86ad8'];
  const gond = cols.map((c, k) => ({ back: makeGondola(c, 'back'), front: makeGondola(c, 'front'), riders: riders[k] || [] }));
  const wrap = a => { a = ((a % TAU) + TAU) % TAU; return a > Math.PI ? a - TAU : a; };
  const pivot = (o, k) => { const a = o.rot + k * TAU / N; return [hx + Math.cos(a) * Rw, hy + Math.sin(a) * Rw]; };
  return {
    x: hx, y: base, rot: 0.2, adj: 0, ix: hx, iy: base + 6, top: base - 8,
    solid: { x: hx - 42, y: base - 7, w: 84, h: 7 },
    update(dt) {
      const w = 0.36 * dt;
      this.rot += w;
      if (this.adj) { const s = Math.sign(this.adj) * Math.min(Math.abs(this.adj), dt * 1.2); this.rot += s; this.adj -= s; }
      const r = Pl.ride;
      if (!r || r.obj !== this) return;
      r.turned += w;
      if (r.turned > Math.PI && !r.top) {
        r.top = true; Sound.yay();
        const [px, py] = pivot(this, r.k);
        burst(px, py - 4, 'confetti', 18); burst(px, py - 4, 'star', 4);
      }
      if (r.turned >= TAU && !this.adj) {
        Pl.ride = null; Pl.x = hx; Pl.y = base + 8; Pl.dir = 'down';
        Pl.jump = 0.42; Sound.boing(); burst(Pl.x, Pl.y - 30, 'star', 3);
      }
    },
    draw(ctx) {
      drawSprite(ctx, rim, hx, hy);
      for (let j = 0; j < 16; j++) {
        const a = this.rot + j * TAU / 16, c = Math.cos(a), s = Math.sin(a);
        line(ctx, hx + c * 6, hy + s * 6, hx + c * (Rw - 1), hy + s * (Rw - 1), '#e8e4dc');
      }
      for (let j = 0; j < 24; j++) {
        const a = this.rot + (j + 0.5) * TAU / 24;
        ctx.fillStyle = (j + Math.floor(G.t * 4)) % 3 === 0 ? '#ff6f9c' : (j + Math.floor(G.t * 4)) % 3 === 1 ? '#fff0b0' : '#8fd8ff';
        ctx.fillRect(Math.round(hx + Math.cos(a) * Rw), Math.round(hy + Math.sin(a) * Rw), 1, 1);
      }
      drawSprite(ctx, legs, hx, hy);
      const mine = Pl.ride && Pl.ride.obj === this ? Pl.ride.k : -1;
      gond.forEach((gd, k) => {
        const [px, py] = pivot(this, k).map(Math.round);
        drawSprite(ctx, gd.back, px, py);
        if (k === mine) drawSpriteRows(ctx, SPR.linaSit, px, py + 28, 0, 18);
        else gd.riders.forEach((rd, i) => {
          const x = px + (gd.riders.length > 1 ? (i ? 4 : -4) : 0);
          if (rd.adult) drawSpriteRows(ctx, rd.S.walk.down[0], x, py + 48, 4, 20);
          else drawSpriteRows(ctx, rd.S.sit, x, py + 28, 0, 18);
        });
        drawSprite(ctx, gd.front, px, py);
      });
    },
    glowFn() {
      for (let j = 0; j < 24; j += 3) { const a = this.rot + (j + 0.5) * TAU / 24; glow(hx + Math.cos(a) * Rw, hy + Math.sin(a) * Rw, 7, '255,200,160', 0.14); }
    },
    interact(o) {
      let best = 0, bd = 9;
      for (let k = 0; k < N; k++) { const d = wrap(Math.PI / 2 - (o.rot + k * TAU / N)); if (Math.abs(d) < Math.abs(bd)) { bd = d; best = k; } }
      o.adj = bd; gond[best].riders = [];
      Pl.ride = { obj: o, k: best, turned: 0, top: false }; Pl.vx = Pl.vy = 0;
      Sound.step('wood'); Sound.pop();
    },
    rideUpdate() {
      if (Input.pressed('interact') || Input.pressed('bell')) { const [px, py] = pivot(this, Pl.ride.k); Sound.chirp(); burst(px, py + 2, 'heart', 2); }
    },
    focus() { const [px, py] = pivot(this, Pl.ride.k); return [px, py + 18]; },
  };
}

// ---- the maypole --------------------------------------------------------------------
function makeMaibaum() {
  return sprite(40, 172, 20, 171, g => {
    spiralPole(g, 18, 20, 4, 152);
    for (let i = 0; i < 4; i++) poly(g, [[20, i * 4], [26 + i, 7 + i * 4], [14 - i, 7 + i * 4]], i & 1 ? '#3c6934' : '#4f8a3a');
    for (let a = 0; a < TAU; a += 0.08) R(g, Math.round(20 + Math.cos(a) * 10) - 1, Math.round(30 + Math.sin(a) * 3) - 1, 2, 2, a > Math.PI ? '#3c6934' : '#4f8a3a');
    for (const [x, c] of [[11, '#e5484d'], [15, BLUE], [25, '#ffd35a'], [29, WHITE]]) R(g, x, 32, 1, 10 + (x % 3) * 3, c);
    // little signs on arms, alternating sides: a heart, a Maß, a Brezn, a horse
    [[56, -1], [82, 1], [108, -1], [134, 1]].forEach(([y, sd], i) => {
      R(g, sd < 0 ? 6 : 22, y, 12, 1, '#6f4a2a');
      const bx = sd < 0 ? 1 : 27;
      R(g, bx, y + 1, 12, 10, '#6f4a2a'); R(g, bx + 1, y + 2, 10, 8, '#fbf0d8');
      if (i === 0) lebHeart(g, bx + 1, y + 2, '#f28bb0');
      if (i === 1) { R(g, bx + 3, y + 4, 4, 5, '#f0a82a'); R(g, bx + 3, y + 3, 4, 1, '#fffaf0'); R(g, bx + 7, y + 5, 1, 3, '#bcd8e2'); }
      if (i === 2) BREZN_ROWS.forEach((row, j) => { for (let x = 0; x < 9; x++) if (row[x] === '#') P(g, bx + 1 + x, y + 4 + j, '#a0582a'); });
      if (i === 3) { R(g, bx + 2, y + 5, 6, 2, '#8a5a38'); R(g, bx + 7, y + 3, 2, 3, '#8a5a38'); for (const lx of [2, 4, 6, 7]) P(g, bx + lx, y + 7, '#8a5a38'); }
    });
  });
}

// ---- the fairground -----------------------------------------------------------------
function paintWiesnGround() {
  const { W, H } = WIESN, ex = W / 2;
  const [c, g] = makeCanvas(W, H);
  const r = rng(1810);
  paintLawn(g, W, H, r, 70, 60);
  // trampled sandy ground, worn into the grass at the edges
  for (let y = 126; y < H; y++) for (let x = 20; x < W - 20; x++) {
    const d = Math.hypot(Math.max(0, 44 - x, x - (W - 44)), Math.max(0, 150 - y));
    if (d > 10 + r() * 8) continue;
    P(g, x, y, r() < 0.7 ? '#d6c49c' : pick(r, ['#c9b48a', '#e2d3ae', '#bfa87c', '#d0bc92']));
  }
  for (let i = 0; i < 700; i++) {
    const x = 40 + r() * (W - 80) | 0, y = 150 + r() * (H - 160) | 0;
    R(g, x, y, 2, 1, pick(r, ['#bfa87c', '#e8dcc0', '#a8906a'])); if (r() < 0.3) P(g, x, y + 1, '#9a8260');
  }
  // the street coming in at the bottom
  paintCobbles(g, r, ex - 32, H - 34, ex + 32, H, true);
  R(g, ex - 34, H - 34, 2, 34, '#d8d1c4'); R(g, ex + 32, H - 34, 2, 34, '#d8d1c4');
  for (let x = ex - 32; x < ex + 32; x++) for (let y = H - 40; y < H - 30; y++) if (r() < (H - 30 - y) / 10) P(g, x, y, pick(r, ['#d6c49c', '#c9b48a']));
  return c;
}

function buildWiesn() {
  const { W, H } = WIESN, ex = W / 2;
  const sc = {
    id: 'wiesn', w: W, h: H, outdoor: true, bikes: true, mood: 'fest', objects: [], solids: [], doors: [],
    bounds: { x0: 26, y0: 150, x1: W - 26, y1: H + 4 },
    ground: paintWiesnGround(),
    surfaceAt: (x, y) => (Math.abs(x - ex) < 32 && y > H - 34) || x < 36 || x > W - 36 ? 'soft' : 'gravel',
  };
  sc.entry = { x: ex, y: H - 18 };
  sc.doors.push({ x: ex - 32, y: H - 6, w: 64, h: 12, need: 'down', to: 'out', at: { x: OUT.junction, y: 136, dir: 'down' } });
  const add = o => { sc.objects.push(o); if (o.solid) sc.solids.push(o.solid); return o; };
  const r = rng(1811);

  // trees all round the back and the sides
  const oaks = [0, 1, 2, 3, 4].map(i => makeTree(400 + i, i === 2 ? 'autumn' : i === 4 ? 'lime' : 'green'));
  const pines = [0, 1].map(i => makePine(420 + i));
  const tree = (x, y) => add(obj(x, y, r() < 0.35 ? pick(r, pines) : pick(r, oaks), { shadow: [14, 4], tree: true }));
  for (let x = 10; x < W; x += 24 + r() * 12) tree(x, 60 + r() * 16);
  for (let x = 24; x < W; x += 30 + r() * 14) tree(x, 104 + r() * 16);
  for (let y = 150; y < H - 40; y += 26 + r() * 10) { tree(10 + r() * 6, y); tree(W - 10 - r() * 6, y); }
  for (const x of [20, W - 20]) add(obj(x, H - 6, makeBush(9, '#f28bb0'), { shadow: [10, 2] }));

  // the fence along the bottom, open where the street comes in
  for (const [x0, x1] of [[20, ex - 34], [ex + 34, W - 20]]) add(obj(x0, H - 8, makeFence(x1 - x0), {}));
  sc.solids.push({ x: 0, y: H - 12, w: ex - 34, h: 16 }, { x: ex + 34, y: H - 12, w: W - ex - 34, h: 16 });

  // lamps
  const lamp = makeLamp();
  for (const [x, y] of [[232, 196], [338, 300], [60, 380], [ex - 44, H - 26], [ex + 44, H - 26]]) {
    add(obj(x, y, lamp, { shadow: [4, 1], solid: { x: x - 2, y: y - 3, w: 4, h: 3 }, glow: { dy: -38, r: 30 } }));
  }

  // the Ferris wheel, top left (who rides in which gondola)
  const K = i => ({ S: kidSprites(KID_LOOKS[i]) }), A = i => ({ S: adultSprites(ADULT_LOOKS[i]), adult: true });
  add(ferrisWheel(118, 112, [[K(0), A(1)], [], [K(3)], [A(4), A(5)], [], [K(6), K(1)], [A(7)], []]));

  // the beer tent with its beer garden in front
  const tent = makeTent();
  add(obj(448, 146, tent, {
    glowFn() {
      glow(448, 128, 26, '255,190,110', 0.22);
      for (const px of [38, 62, 138, 162]) glow(448 - 100 + px, 146 - 111 + 80, 12, '255,210,130', 0.18);
    },
  }));
  const waitress = add(makeWaitress({ x: 448, y: 152 }));
  const A_ = i => i === null ? null : ADULT_LOOKS[i];
  for (const [tx, ty, n, s] of [
    [390, 206, [0, null, 3, 5], [2, 4, null, 1]],
    [506, 206, [7, 6, null, 1], [null, 0, 3, null]],
    [390, 262, [null, 1, 4, null], [5, null, 7, 6]],
    [506, 262, [2, null, 5, 0], [null, 6, null, 4]],
  ]) add(beerTable(tx, ty, n.map(A_), s.map(A_), waitress));

  // the maypole, the gingerbread stand and the carousel
  add(obj(272, 228, makeMaibaum(), { shadow: [4, 1], solid: { x: 269, y: 225, w: 6, h: 3 } }));
  add(heartStand(144, 330));
  add(carousel(452, 368, [null, kidSprites(KID_LOOKS[2]), null, null, kidSprites(KID_LOOKS[4]), null]));

  // grown-ups strolling about, children with balloons
  const area = { x0: 40, y0: 206, x1: 434, y1: 424 };
  for (const [i, x, y] of [[0, 250, 330], [1, 200, 250], [2, 330, 400], [3, 90, 240], [4, 300, 280], [5, 230, 420], [6, 380, 300]]) {
    add(makeAdult(ADULT_LOOKS[i], x, y, { mode: 'wander', area }));
  }
  add(makeAdult(ADULT_LOOKS[7], 206, 344, { dir: 'right', looks: ['right', 'right', 'down'] }));
  add(makeAdult(ADULT_LOOKS[2], 226, 346, { dir: 'left', looks: ['left', 'left', 'down'] }));
  add(makeKid(KID_LOOKS[5], 400, 412, { dir: 'up', looks: ['up', 'up', 'left'], play: true, extra: balloon('#e5484d') }));
  add(makeKid(KID_LOOKS[0], 180, 390, { mode: 'wander', area, extra: balloon('#ffd35a') }));
  add(makeKid(KID_LOOKS[7], 320, 360, { mode: 'wander', area, extra: balloon('#4a8ad0') }));
  add(makeKid(KID_LOOKS[3], 110, 290, { mode: 'wander', area }));
  return { wiesn: sc };
}
