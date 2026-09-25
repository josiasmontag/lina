'use strict';
// ---------------------------------------------------------------------------
// Characters: Lina, her pink woom bike, the neighbourhood cat, UI icons.
// Everything is drawn pixel by pixel in code and auto-outlined.
// ---------------------------------------------------------------------------

// Lina's palette, picked from her photos: dark brown hair with a thick blunt
// fringe, terracotta quilted vest with fluffy tan fleece trim, gray-blue
// polka-dot top, light pink pants, pink velcro sneakers.
const LC = {
  hair: '#3a2318', hairHi: '#6b4531', hairDk: '#26150e',
  skin: '#f7d4b6', skinSh: '#e8b596', blush: '#f2a292', eye: '#1d130f', eyeHi: '#ffffff', mouth: '#c46c62',
  vest: '#c47a62', vestSh: '#9e5a47', vestHi: '#dc9a80',
  fur: '#c99466', furSh: '#a5714a', furHi: '#e2b58a', zip: '#d9ad4e',
  sw: '#8ea2a7', swSh: '#708489', swDot: '#f4f1ea',
  pants: '#f1e2de', pantsSh: '#d2bcb8', dot: '#e3c46a',
  shoe: '#dc8c88', shoeDk: '#a95f5c',
};

// ---- Lina, front view ------------------------------------------------------
function frontLeg(g, x, lift) {
  R(g, x, 22, 3, 4 - lift, LC.pants); R(g, x + 2, 22, 1, 4 - lift, LC.pantsSh); P(g, x + 1, 23, LC.dot);
  R(g, x, 26 - lift, 3, 2, LC.shoe); R(g, x, 26 - lift, 3, 1, LC.shoeDk); R(g, x, 27 - lift, 3, 1, LC.shoe);
}
// polka-dot sleeve + hand
function frontArm(g, x, y, a) {
  R(g, x, y, 2, 5 + a, LC.sw);
  if (x > 9) R(g, x + 1, y, 1, 5 + a, LC.swSh);
  P(g, x, y + 1, LC.swDot); P(g, x + 1, y + 3, LC.swDot); if (a) P(g, x, y + 5, LC.swDot);
  R(g, x, y + 5 + a, 2, 2, LC.skin);
}

// open quilted vest with fleece lapels, polka-dot top peeking out
function vestFront(g, o) {
  const c = LC;
  R(g, 5, 14 + o, 10, 9, c.vest); R(g, 13, 14 + o, 2, 9, c.vestSh);
  R(g, 5, 18 + o, 10, 1, c.vestSh); R(g, 5, 21 + o, 10, 1, c.vestSh);
  R(g, 6, 16 + o, 2, 1, c.vestHi); R(g, 6, 19 + o, 2, 1, c.vestHi); R(g, 11, 19 + o, 1, 1, c.vestHi);
  // V-neck: polka-dot top between fluffy fleece lapels
  R(g, 8, 13 + o, 4, 2, c.sw); R(g, 9, 15 + o, 2, 1, c.sw); P(g, 10, 13 + o, c.swDot);
  R(g, 5, 13 + o, 3, 1, c.fur); R(g, 12, 13 + o, 3, 1, c.fur);
  P(g, 7, 14 + o, c.fur); P(g, 8, 15 + o, c.fur); P(g, 9, 16 + o, c.fur); P(g, 7, 13 + o, c.furHi);
  P(g, 12, 14 + o, c.furSh); P(g, 11, 15 + o, c.furSh); P(g, 10, 16 + o, c.furSh);
  R(g, 9, 17 + o, 1, 6, c.zip); R(g, 10, 17 + o, 1, 6, c.vestSh); P(g, 9, 18 + o, '#fff1c0');
}

// Current hairstyle used while building sprites: 'pigtails' or 'loose'.
let HAIR = 'pigtails';
const SCRUNCHIE = { lilac: '#c9a0dc', mint: '#94d6bb' };

// One low pigtail: scrunchie at the top, hair tapering to a point.
function pigtail(g, x, y, band, len = 8) {
  const c = LC;
  R(g, x, y + 2, 3, len - 3, c.hair); R(g, x + 1, y + len - 1, 2, 2, c.hair); P(g, x + 1, y + len + 1, c.hair);
  P(g, x + 1, y + 3, c.hairHi); P(g, x + 1, y + 5, c.hairHi); P(g, x + 2, y + 7, c.hairDk);
  R(g, x, y, 3, 2, band); P(g, x, y, shade(band, 0.35)); P(g, x + 2, y + 1, shade(band, -0.25));
}

// Both hands pressed over her ears, elbows out (front and back view).
function earArms(g, o) {
  const c = LC;
  for (const m of [false, true]) {
    const X = (x, w = 1) => m ? 19 - x - (w - 1) : x;
    R(g, X(3, 2), 13 + o, 2, 3, c.sw);
    R(g, X(1, 2), 10 + o, 2, 4, c.sw); P(g, X(1), 12 + o, c.swDot);
    R(g, X(2, 3), 8 + o, 3, 3, c.skin); P(g, X(2), 10 + o, c.skinSh);
  }
}

function linaFront(g, s, o, riding, blink, ears) {
  const c = LC;
  if (HAIR === 'loose') { // full hair falling behind the shoulders
    R(g, 3, 6 + o, 14, 13, c.hair); R(g, 4, 19 + o, 12, 1, c.hair);
    P(g, 4, 20 + o, c.hair); P(g, 7, 20 + o, c.hair); P(g, 12, 20 + o, c.hair); P(g, 15, 20 + o, c.hair);
    R(g, 3, 11 + o, 1, 7, c.hairDk); R(g, 16, 11 + o, 1, 7, c.hairDk);
  }
  if (!riding) { frontLeg(g, 6, s > 0 ? 1 : 0); frontLeg(g, 11, s < 0 ? 1 : 0); }
  vestFront(g, o);
  if (ears) {
    linaHead(g, o, false);
    // eyes squeezed shut: > <
    R(g, 6, 8 + o, 2, 2, c.skin); R(g, 12, 8 + o, 2, 2, c.skin);
    P(g, 6, 8 + o, c.eye); P(g, 7, 9 + o, c.eye); P(g, 6, 10 + o, c.eye);
    P(g, 13, 8 + o, c.eye); P(g, 12, 9 + o, c.eye); P(g, 13, 10 + o, c.eye);
    earArms(g, o);
    return;
  }
  frontArm(g, 3, 15 + o, riding ? 0 : (s < 0 ? 1 : 0));
  frontArm(g, 15, 15 + o, riding ? 0 : (s > 0 ? 1 : 0));
  linaHead(g, o, blink);
}

// Face + hair, front view (also used for Lina asleep on the pillow).
function linaHead(g, o, blink) {
  const c = LC;
  // round face
  R(g, 4, 6 + o, 12, 7, c.skin); R(g, 15, 7 + o, 1, 5, c.skinSh);
  P(g, 4, 12 + o, c.hair); P(g, 15, 12 + o, c.hair);
  // hair cap + thick blunt fringe with wispy tips
  R(g, 6, 0 + o, 8, 1, c.hair); R(g, 4, 1 + o, 12, 1, c.hair); R(g, 3, 2 + o, 14, 5, c.hair);
  P(g, 5, 7 + o, c.hair); P(g, 8, 7 + o, c.hair); P(g, 11, 7 + o, c.hair); P(g, 14, 7 + o, c.hair);
  const side = HAIR === 'loose' ? 8 : 4;
  R(g, 3, 7 + o, 1, side, c.hair); R(g, 16, 7 + o, 1, side, c.hair);
  R(g, 4, 7 + o, 1, 2, c.hair); R(g, 15, 7 + o, 1, 2, c.hair);
  R(g, 6, 2 + o, 5, 1, c.hairHi); R(g, 5, 3 + o, 2, 1, c.hairHi); R(g, 12, 2 + o, 2, 1, c.hairHi);
  if (HAIR === 'pigtails') { pigtail(g, 1, 9 + o, SCRUNCHIE.lilac); pigtail(g, 16, 9 + o, SCRUNCHIE.mint); }
  // dark eyes, set wide
  if (blink) {
    R(g, 6, 9 + o, 2, 1, c.eye); R(g, 12, 9 + o, 2, 1, c.eye);
  } else {
    R(g, 6, 8 + o, 2, 2, c.eye); P(g, 6, 8 + o, c.eyeHi);
    R(g, 12, 8 + o, 2, 2, c.eye); P(g, 12, 8 + o, c.eyeHi);
  }
  P(g, 5, 10 + o, c.blush); P(g, 14, 10 + o, c.blush);
  P(g, 10, 10 + o, c.skinSh);
  R(g, 9, 11 + o, 2, 1, c.mouth);
}

// ---- Lina, back view -------------------------------------------------------
function linaBack(g, s, o, riding, ears) {
  const c = LC;
  if (!riding) { frontLeg(g, 6, s > 0 ? 1 : 0); frontLeg(g, 11, s < 0 ? 1 : 0); }
  R(g, 5, 14 + o, 10, 9, c.vest); R(g, 13, 14 + o, 2, 9, c.vestSh);
  R(g, 5, 18 + o, 10, 1, c.vestSh); R(g, 5, 21 + o, 10, 1, c.vestSh);
  R(g, 5, 13 + o, 10, 2, c.fur); R(g, 5, 14 + o, 10, 1, c.furSh);
  if (!ears) {
    frontArm(g, 3, 15 + o, riding ? 0 : (s > 0 ? 1 : 0));
    frontArm(g, 15, 15 + o, riding ? 0 : (s < 0 ? 1 : 0));
  }
  R(g, 6, 0 + o, 8, 1, c.hair); R(g, 4, 1 + o, 12, 1, c.hair); R(g, 3, 2 + o, 14, 12, c.hair);
  R(g, 6, 2 + o, 5, 1, c.hairHi); R(g, 5, 3 + o, 2, 1, c.hairHi); R(g, 12, 2 + o, 2, 1, c.hairHi);
  if (HAIR === 'loose') {
    R(g, 4, 14 + o, 12, 4, c.hair); R(g, 5, 18 + o, 10, 1, c.hair);
    P(g, 5, 19 + o, c.hair); P(g, 8, 19 + o, c.hair); P(g, 11, 19 + o, c.hair); P(g, 14, 19 + o, c.hair);
    R(g, 6, 8 + o, 1, 10, c.hairDk); R(g, 13, 9 + o, 1, 9, c.hairDk); R(g, 9, 11 + o, 1, 7, c.hairDk);
    R(g, 10, 4 + o, 1, 3, c.hairHi);
  } else {
    // centre parting, hair gathered into two pigtails
    R(g, 9, 1 + o, 1, 9, '#8a5a44'); R(g, 4, 13 + o, 12, 1, c.hair);
    R(g, 6, 6 + o, 1, 6, c.hairDk); R(g, 13, 6 + o, 1, 6, c.hairDk);
    pigtail(g, 1, 9 + o, SCRUNCHIE.mint); pigtail(g, 16, 9 + o, SCRUNCHIE.lilac);
  }
  if (ears) earArms(g, o);
}

// ---- Lina, side view (facing right) ----------------------------------------
function sideLeg(g, x, back) {
  R(g, x, 22, 3, 4, back ? LC.pantsSh : LC.pants);
  R(g, x, 26, 4, 2, back ? LC.shoeDk : LC.shoe);
  if (!back) { P(g, x + 1, 23, LC.dot); R(g, x + 1, 26, 3, 1, LC.shoeDk); }
}
function linaSide(g, s, o, riding, blink, ears) {
  const c = LC;
  if (HAIR === 'loose') {
    R(g, 3, 5 + o, 8, 14, c.hair); R(g, 4, 19 + o, 6, 1, c.hair); P(g, 4, 20 + o, c.hair); P(g, 8, 20 + o, c.hair);
  }
  if (!riding) { sideLeg(g, 8 - 2 * s, true); sideLeg(g, 8 + 2 * s, false); }
  R(g, 6, 14 + o, 7, 9, c.vest); R(g, 6, 14 + o, 1, 9, c.vestSh);
  R(g, 6, 18 + o, 7, 1, c.vestSh); R(g, 6, 21 + o, 7, 1, c.vestSh);
  R(g, 10, 16 + o, 2, 1, c.vestHi); R(g, 10, 19 + o, 2, 1, c.vestHi);
  R(g, 6, 13 + o, 7, 2, c.fur); R(g, 12, 13 + o, 1, 5, c.fur); P(g, 12, 13 + o, c.furHi);
  // head
  R(g, 7, 6 + o, 8, 7, c.skin); P(g, 15, 9 + o, c.skin); P(g, 15, 10 + o, c.skinSh);
  R(g, 6, 0 + o, 7, 1, c.hair); R(g, 4, 1 + o, 10, 1, c.hair); R(g, 3, 2 + o, 12, 5, c.hair);
  R(g, 3, 7 + o, 7, HAIR === 'loose' ? 8 : 6, c.hair); P(g, 11, 7 + o, c.hair); P(g, 14, 7 + o, c.hair);
  R(g, 6, 2 + o, 5, 1, c.hairHi); R(g, 4, 3 + o, 2, 1, c.hairHi); P(g, 5, 9 + o, c.hairHi);
  if (HAIR === 'loose') P(g, 4, 12 + o, c.hairHi);
  else pigtail(g, 2, 10 + o, SCRUNCHIE.lilac);
  if (blink) R(g, 12, 9 + o, 2, 1, c.eye);
  else { R(g, 12, 8 + o, 2, 2, c.eye); P(g, 13, 8 + o, c.eyeHi); }
  P(g, 12, 10 + o, c.blush); P(g, 14, 11 + o, c.mouth);
  if (ears) {
    R(g, 12, 8 + o, 2, 2, c.skin); P(g, 13, 8 + o, c.eye); P(g, 12, 9 + o, c.eye); P(g, 13, 10 + o, c.eye);
    R(g, 10, 12 + o, 2, 4, c.sw); R(g, 10, 10 + o, 2, 2, c.sw); P(g, 11, 13 + o, c.swDot);
    R(g, 7, 8 + o, 3, 3, c.skin); P(g, 7, 10 + o, c.skinSh);
  } else if (!riding) {
    R(g, 9 - s, 15 + o, 2, 5, c.sw); R(g, 10 - s, 15 + o, 1, 5, c.swSh);
    P(g, 9 - s, 16 + o, c.swDot); P(g, 10 - s, 18 + o, c.swDot);
    R(g, 9 - s, 20 + o, 2, 2, c.skin);
  }
}

function linaWalk(dir, f, blink, ears = false) {
  const s = [0, 1, 0, -1][f];
  const o = s !== 0 ? 1 : 0;
  return sprite(20, 29, 10, 28, g => {
    if (dir === 'down') linaFront(g, s, o, false, blink, ears);
    else if (dir === 'up') linaBack(g, s, o, false, ears);
    else linaSide(g, s, o, false, blink, ears);
  });
}

// ---- The pink woom bike ------------------------------------------------------
const BC = {
  frame: '#e2336f', frameHi: '#f7739b', frameSh: '#a61d4f', white: '#f5f3f0', whiteSh: '#c9c6c3',
  tire: '#1f1c1f', tireHi: '#3f3a3e', rim: '#d2d6d9', hub: '#8b8f94', black: '#27242b', green: '#3fbf4a', red: '#e0413a',
};

// Wheel seen from the side: knobby tire, silver rim, see-through spokes.
function wheelSide(g, cx, cy, rot) {
  for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) {
    const d = Math.sqrt(x * x + y * y);
    if (d <= 6.5 && d > 5.0) P(g, cx + x, cy + y, (d > 5.9 && ((x + y + rot) & 1)) ? BC.tireHi : BC.tire);
    else if (d <= 5.0 && d > 4.1) P(g, cx + x, cy + y, BC.rim);
    else if (d <= 4.1) P(g, cx + x, cy + y, HOLE);
  }
  const a = rot * Math.PI / 6;
  for (let k = 0; k < 3; k++) {
    const aa = a + k * Math.PI / 3, dx = Math.round(Math.cos(aa) * 4), dy = Math.round(Math.sin(aa) * 4);
    line(g, cx - dx, cy - dy, cx + dx, cy + dy, BC.whiteSh);
  }
  R(g, cx - 1, cy - 1, 2, 2, BC.hub);
}

// side view, facing right, 34x24; wheels touch y=23
// Key points: rear hub (7,16), front hub (26,16), bottom bracket (15,17), saddle (11,6)
function bikeSide(g, rot, pedal, parked) {
  const F = BC;
  wheelSide(g, 7, 16, rot); wheelSide(g, 26, 16, rot);
  // keep the inside of the frame triangle see-through (no outline fill)
  poly(g, [[13, 11], [22, 9], [16, 16]], HOLE);
  poly(g, [[8, 15], [12, 10], [14, 16]], HOLE);
  // rear triangle
  line(g, 15, 17, 7, 16, F.frameSh);
  line(g, 12, 10, 7, 16, F.frame);
  // chain guard
  R(g, 8, 15, 9, 3, F.black); R(g, 9, 14, 7, 1, F.black); R(g, 9, 18, 7, 1, F.black); R(g, 9, 15, 6, 1, F.tireHi);
  // seat tube, top tube, down tube
  line(g, 15, 17, 12, 8, F.frame, 2); line(g, 13, 11, 12, 8, F.frameHi);
  line(g, 12, 11, 22, 9, F.frame, 2); line(g, 13, 10, 21, 8, F.frameHi);
  line(g, 15, 17, 23, 11, F.frame, 2); line(g, 16, 15, 22, 11, F.frameHi);
  // "woom" logo dots on the down tube
  P(g, 18, 14, F.white); P(g, 19, 14, F.white); P(g, 20, 13, F.white);
  // head tube + white fork
  R(g, 22, 7, 2, 5, F.frame); P(g, 22, 7, F.frameHi);
  line(g, 23, 11, 26, 16, F.white, 2); P(g, 24, 12, F.whiteSh);
  // saddle + seat post
  R(g, 12, 6, 1, 3, F.hub);
  R(g, 8, 5, 7, 1, F.black); R(g, 9, 6, 5, 1, F.black); P(g, 8, 5, F.tireHi);
  // stem + handlebar with green brake lever
  line(g, 23, 7, 22, 4, F.black);
  R(g, 18, 3, 5, 2, F.black); P(g, 18, 3, F.tireHi); P(g, 20, 5, F.green);
  // crank + pedal
  const a = pedal * Math.PI / 2, px = 15 + Math.round(Math.cos(a) * 3), py = 17 + Math.round(Math.sin(a) * 3);
  line(g, 15, 17, px, py, F.hub); R(g, px - 1, py, 3, 1, F.black); R(g, 14, 16, 2, 2, F.hub);
  if (parked) line(g, 14, 18, 12, 23, F.hub);
}

// front view (coming towards camera), 14x20
function bikeFront(g, rot) {
  R(g, 5, 8, 4, 12, BC.tire); R(g, 6, 8, 2, 12, BC.tireHi);
  for (let y = 8; y < 20; y++) if ((y + rot) & 1) { P(g, 5, y, BC.tireHi); P(g, 8, y, BC.tire); }
  R(g, 4, 5, 2, 10, BC.white); R(g, 8, 5, 2, 10, BC.white); R(g, 5, 5, 1, 10, BC.whiteSh);
  R(g, 4, 13, 6, 2, BC.hub);
  R(g, 5, 2, 4, 5, BC.frame); R(g, 5, 2, 1, 5, BC.frameHi); R(g, 6, 3, 2, 2, BC.white);
  R(g, 1, 2, 12, 2, BC.black); R(g, 0, 2, 2, 3, BC.black); R(g, 12, 2, 2, 3, BC.black);
  P(g, 2, 4, BC.green); P(g, 11, 4, BC.red);
}

// back view, split into layers so Lina can sit between them
function bikeBack(g, rot, layer) {
  if (layer === 'behind') {
    R(g, 1, 2, 12, 2, BC.black); R(g, 0, 2, 2, 3, BC.black); R(g, 12, 2, 2, 3, BC.black);
    R(g, 5, 4, 4, 4, BC.frame);
  } else {
    R(g, 5, 9, 4, 11, BC.tire); R(g, 6, 9, 2, 11, BC.tireHi);
    for (let y = 9; y < 20; y++) if ((y + rot) & 1) { P(g, 5, y, BC.tireHi); P(g, 8, y, BC.tire); }
    line(g, 4, 14, 6, 6, BC.frame, 2); line(g, 9, 14, 7, 6, BC.frame, 2);
    R(g, 5, 6, 4, 2, BC.frame); R(g, 5, 6, 4, 1, BC.frameHi);
    R(g, 6, 9, 2, 2, BC.red);
    R(g, 10, 11, 2, 5, BC.black);
  }
}

function makeRider(dir, f) {
  const rot = f, pedal = f;
  if (dir === 'right') {
    return sprite(40, 46, 20, 45, g => {
      const bx = 3, by = 22, hip = [15, 29];
      const pedalPos = ph => { const a = ph * Math.PI / 2; return [bx + 15 + Math.round(Math.cos(a) * 3), by + 17 + Math.round(Math.sin(a) * 3)]; };
      const leg = (ph, far) => {
        const [px, py] = pedalPos(ph);
        const kx = Math.round((hip[0] + px) / 2) + 3, ky = Math.round((hip[1] + py) / 2) - 2;
        const col = far ? LC.pantsSh : LC.pants;
        line(g, hip[0], hip[1], kx, ky, col, 2); line(g, kx, ky, px, py - 1, col, 2);
        R(g, px - 1, py - 1, 4, 2, far ? LC.shoeDk : LC.shoe);
      };
      leg(pedal + 2, true);
      g.save(); g.translate(bx, by); bikeSide(g, rot, pedal, false); g.restore();
      g.save(); g.translate(5, 7); linaSide(g, 0, 0, true, false); g.restore();
      leg(pedal, false);
      line(g, 14, 22, 20, 25, LC.sw, 2); R(g, 21, 25, 2, 2, LC.skin);
    });
  }
  const legs = g => {
    const a = pedal * Math.PI / 2, d = Math.round(Math.sin(a) * 2);
    const yl = 34 + d, yr = 34 - d;
    R(g, 8, 26, 3, yl - 26, LC.pants); P(g, 9, 28, LC.dot); R(g, 8, yl, 3, 2, LC.shoe);
    R(g, 13, 26, 3, yr - 26, LC.pants); R(g, 15, 26, 1, yr - 26, LC.pantsSh); R(g, 13, yr, 3, 2, LC.shoe);
  };
  if (dir === 'down') {
    return sprite(24, 42, 12, 41, g => {
      g.save(); g.translate(2, 5); linaFront(g, 0, 0, true, false); g.restore();
      legs(g);
      g.save(); g.translate(5, 22); bikeFront(g, rot); g.restore();
      R(g, 5, 25, 2, 2, LC.skin); R(g, 17, 25, 2, 2, LC.skin);
    });
  }
  return sprite(24, 42, 12, 41, g => { // up
    g.save(); g.translate(5, 22); bikeBack(g, rot, 'behind'); g.restore();
    legs(g);
    g.save(); g.translate(2, 5); linaBack(g, 0, 0, true); g.restore();
    g.save(); g.translate(5, 22); bikeBack(g, rot, 'front'); g.restore();
  });
}

// ---- Cat -------------------------------------------------------------------
function makeCat(f, sit) {
  const o = '#e39a4b', d = '#b8692c', l = '#f7d9ae', e = '#1d130f';
  return sprite(15, 12, 7, 11, g => {
    if (!sit) {
      const s = [0, 1, 0, -1][f];
      R(g, 3 + s, 8, 1, 3, d); R(g, 9 + s, 8, 1, 3, d);
      R(g, 2, 4, 9, 5, o); R(g, 3, 8, 7, 1, l);
      P(g, 4, 4, d); P(g, 6, 4, d); P(g, 8, 4, d); P(g, 4, 5, d); P(g, 6, 5, d);
      R(g, 4 - s, 8, 1, 3, o); R(g, 10 - s, 8, 1, 3, o);
      line(g, 2, 5, 0, 2 + (f & 1), o); P(g, 0, 1 + (f & 1), d);
      R(g, 9, 1, 5, 5, o); P(g, 9, 0, o); P(g, 13, 0, o); R(g, 11, 4, 3, 2, l);
      P(g, 12, 2, e); P(g, 13, 4, '#e7837f');
    } else {
      line(g, 3, 10, 0, 7, o);
      R(g, 3, 4, 6, 7, o); R(g, 4, 7, 3, 4, l); P(g, 8, 6, d); P(g, 8, 8, d);
      R(g, 4, 10, 2, 1, l); R(g, 7, 10, 2, 1, l);
      R(g, 5, 0, 6, 5, o); P(g, 5, -1 + 1, o); P(g, 10, 0, o); P(g, 6, 0, o);
      R(g, 7, 3, 3, 2, l); P(g, 7, 2, e); P(g, 9, 2, e); P(g, 8, 3, '#e7837f');
    }
  });
}

// ---- Icons & particles -----------------------------------------------------
const GLYPH = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  E: ['###', '#..', '##.', '#..', '###'],
};
const BMP = {
  heart: ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'],
  note: ['..##.', '..#.#', '..#..', '..#..', '###..', '###..', '.#...'],
  star: ['..#..', '.###.', '#####', '.###.', '##.##'],
  z: ['####', '..#.', '.#..', '####'],
};

function makeIcons() {
  const I = {};
  I.key = sprite(11, 12, 5, 11, g => {
    R(g, 0, 1, 11, 10, '#cfc3ad'); R(g, 1, 0, 9, 10, '#f5eddc'); R(g, 0, 1, 11, 8, '#f5eddc');
    R(g, 1, 9, 9, 2, '#b3a68e');
    bitmap(g, GLYPH.E, 4, 2, '#3b2a22');
  });
  I.pad = sprite(11, 11, 5, 10, g => {
    disc(g, 5, 5, 5, '#2f9e44'); disc(g, 5, 4, 4, '#48c35c');
    bitmap(g, GLYPH.A, 4, 2, '#ffffff');
  });
  I.heart = sprite(7, 6, 3, 5, g => { bitmap(g, BMP.heart, 0, 0, '#ff6f9c'); P(g, 1, 1, '#ffc2d6'); });
  I.star = sprite(5, 5, 2, 4, g => bitmap(g, BMP.star, 0, 0, '#ffd84a'));
  I.z = sprite(4, 4, 2, 3, g => bitmap(g, BMP.z, 0, 0, '#bfe3ff'));
  I.notes = ['#ff7aa8', '#7ac8ff', '#ffd24a', '#8be07a', '#c79bff'].map(col =>
    sprite(5, 7, 2, 6, g => bitmap(g, BMP.note, 0, 0, col)));
  return I;
}

// ---- Build everything once ------------------------------------------------
function buildLinaSet(style) {
  HAIR = style;
  const S = { lina: {}, blink: {}, rider: {}, ears: {} };
  for (const dir of ['down', 'up', 'right']) {
    S.lina[dir] = [0, 1, 2, 3].map(f => linaWalk(dir, f, false));
    S.ears[dir] = [0, 1, 2, 3].map(f => linaWalk(dir, f, false, true));
    S.rider[dir] = [0, 1, 2, 3].map(f => makeRider(dir, f));
  }
  S.blink.down = linaWalk('down', 0, true);
  S.blink.right = linaWalk('right', 0, true);
  S.blink.up = S.lina.up[0];
  S.lina.left = S.lina.right.map(mirrorSprite);
  S.ears.left = S.ears.right.map(mirrorSprite);
  S.rider.left = S.rider.right.map(mirrorSprite);
  S.blink.left = mirrorSprite(S.blink.right);
  // head on the pillow, eyes closed (for sleeping in bed)
  S.sleepHead = sprite(20, 17, 10, 13, g => {
    if (HAIR === 'loose') R(g, 2, 5, 16, 12, LC.hair);
    linaHead(g, 0, true);
  });
  // Lina sitting (for the swing)
  S.linaSit = sprite(20, 29, 10, 22, g => {
    linaFront(g, 0, 0, true, false);
    R(g, 6, 22, 3, 3, LC.pants); R(g, 11, 22, 3, 3, LC.pants);
    R(g, 6, 25, 3, 2, LC.shoe); R(g, 11, 25, 3, 2, LC.shoe);
  });
  return S;
}

const HAIR_STYLES = ['pigtails', 'loose'];
const SPR = (() => {
  const S = { styles: {} };
  for (const st of HAIR_STYLES) S.styles[st] = buildLinaSet(st);

  const parked = sprite(34, 24, 17, 23, g => bikeSide(g, 0, 1, true));
  S.bike = { right: parked, left: mirrorSprite(parked) };

  S.cat = { right: [0, 1, 2, 3].map(f => makeCat(f, false)), sit: makeCat(0, true) };
  S.cat.left = S.cat.right.map(mirrorSprite);
  S.catSitLeft = mirrorSprite(S.cat.sit);
  S.icon = makeIcons();
  return S;
})();

// Switch Lina's hairstyle (remembered between visits).
function setLinaStyle(style) {
  if (!SPR.styles[style]) style = HAIR_STYLES[0];
  Object.assign(SPR, SPR.styles[style]);
  SPR.hairStyle = style;
  try { localStorage.setItem('lina.hair', style); } catch (e) { /* storage unavailable */ }
}
(() => {
  let saved = null;
  try { saved = localStorage.getItem('lina.hair'); } catch (e) { /* storage unavailable */ }
  setLinaStyle(saved || 'pigtails');
})();
