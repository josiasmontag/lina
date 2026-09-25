'use strict';
// Synthesized sound effects + a generative background score (no audio files).
// The score keeps writing new phrases over changing chords, keys and
// instruments, and fades out whenever the game plays its own tune.

const Sound = (() => {
  let ac = null, master = null, musicBus = null;
  let musicOn = true, hold = false, duckUntil = 0, musicLevel = null;
  const MUSIC_VOL = 0.55;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    // play through the iPhone's silent switch, like a game should
    if (navigator.audioSession) try { navigator.audioSession.type = 'playback'; } catch (e) { /* unsupported */ }
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.6; master.connect(ac.destination);
    // music bus: warm lowpass + a soft echo for a dreamy feel
    musicBus = ac.createGain(); musicBus.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    const delay = ac.createDelay(1); delay.delayTime.value = 0.33;
    const fb = ac.createGain(); fb.gain.value = 0.28;
    const wet = ac.createGain(); wet.gain.value = 0.22;
    musicBus.connect(lp); lp.connect(master);
    lp.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
    setInterval(schedule, 30);
    decodeClips();
  }

  // ------------------------------------------------- recorded sounds -----
  // Fetched right away, decoded once the AudioContext exists.
  const CLIPS = { yay: 'sounds/yay.m4a' };
  const clips = {}, clipBytes = {};
  for (const [name, url] of Object.entries(CLIPS)) {
    fetch(url).then(r => r.ok ? r.arrayBuffer() : null)
      .then(b => { if (b) { clipBytes[name] = b; decodeClips(); } })
      .catch(() => { /* e.g. opened from file://, see playClip */ });
  }
  function decodeClips() {
    if (!ac) return;
    for (const name of Object.keys(clipBytes)) {
      const b = clipBytes[name]; delete clipBytes[name];
      ac.decodeAudioData(b, buf => { clips[name] = buf; }, () => {});
    }
  }
  function playClip(name, vol = 1) {
    if (ac && clips[name]) {
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = clips[name]; g.gain.value = vol;
      s.connect(g); g.connect(master); s.start();
      duck(s.buffer.duration + 0.4);
      return;
    }
    // Pages opened from file:// can't fetch, but an <audio> element still plays.
    try { const a = new Audio(CLIPS[name]); a.volume = Math.min(1, vol * 0.6); a.play().catch(() => {}); } catch (e) { /* no audio */ }
  }

  // One enveloped oscillator. `t` is an absolute AudioContext time (default: now).
  function tone(freq, dur, { type = 'sine', vol = 0.2, attack = 0.006, slide = 0, delay = 0, dest, t, pad = false, vibrato = 0 } = {}) {
    if (!ac) return;
    t = (t ?? ac.currentTime) + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    if (vibrato) {
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 5.2; lg.gain.value = freq * vibrato;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start(t + 0.15); lfo.stop(t + dur + 0.6);
    }
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    if (pad) g.gain.setTargetAtTime(0, t + dur * 0.6, dur * 0.2);
    else g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + (pad ? dur : 0.05));
  }

  function noise(dur, { vol = 0.2, freq = 1000, q = 1, delay = 0, type = 'bandpass', dest, t } = {}) {
    if (!ac) return;
    t = (t ?? ac.currentTime) + delay;
    const len = Math.ceil(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(dest || master); s.start(t);
  }

  // ------------------------------------------------------ music ducking ----
  function updateGain() {
    const now = ac.currentTime;
    const want = musicOn && !hold && now >= duckUntil ? MUSIC_VOL : 0;
    if (want === musicLevel) return;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setValueAtTime(musicBus.gain.value, now);
    musicBus.gain.setTargetAtTime(want, now, want > 0 ? 0.9 : 0.1);
    musicLevel = want;
  }
  function duck(sec) { if (!ac) return; duckUntil = Math.max(duckUntil, ac.currentTime + sec); updateGain(); }

  // --------------------------------------------------- generative score ----
  const SC = [0, 2, 4, 5, 7, 9, 11];
  const PROGS = [[0, 4, 5, 3], [0, 5, 3, 4], [3, 0, 4, 5], [5, 3, 0, 4], [0, 3, 1, 4], [0, 2, 3, 4],
                 [3, 4, 2, 5], [0, 3, 0, 4], [5, 4, 3, 4], [0, 1, 3, 4], [3, 3, 0, 4], [0, 4, 3, 3]];
  // rhythms for one bar of 8 eighth notes: [start, length]
  const RHY = [
    [[0, 2], [2, 2], [4, 2], [6, 2]], [[0, 3], [3, 1], [4, 4]], [[0, 1], [1, 1], [2, 2], [4, 1], [5, 1], [6, 2]],
    [[0, 4], [4, 2], [6, 2]], [[0, 2], [2, 1], [3, 1], [4, 4]], [[1, 1], [2, 2], [4, 2], [6, 1], [7, 1]],
    [[0, 2], [2, 2], [4, 1], [5, 1], [6, 2]], [[0, 6], [6, 1], [7, 1]], [[0, 1], [2, 1], [3, 1], [4, 2], [6, 2]],
  ];
  const CAD = [[[0, 2], [2, 2], [4, 4]], [[0, 1], [1, 1], [2, 2], [4, 4]], [[0, 4], [4, 4]], [[0, 8]]];
  const INSTR = ['box', 'flute', 'marimba', 'pluck', 'bell'];
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  let mood = 'out', moodChanged = false, key = 0, prog = PROGS[0], section = null;
  let bar = 0, step = 0, nextT = 0, secBars = 0, phrase = [], phraseIdx = 0, motif = null;

  const midi = (deg, base) => base + key + 12 * Math.floor(deg / 7) + SC[((deg % 7) + 7) % 7];
  function nearestChordTone(d, root) {
    let best = d, bd = 99;
    for (const c of [root, root + 2, root + 4]) for (let k = -2; k <= 2; k++) {
      const v = c + 7 * k; if (Math.abs(v - d) < bd) { bd = Math.abs(v - d); best = v; }
    }
    return best;
  }

  function newSection() {
    const types = mood === 'out'
      ? ['full', 'full', 'melody', 'soft', 'bouncy', 'bouncy', 'call']
      : ['melody', 'soft', 'soft', 'call', 'melody'];
    const prev = section && section.type;
    let type = rnd(types);
    if (type === prev && Math.random() < 0.6) type = rnd(types);
    section = { type, instr: rnd(INSTR), arp: Math.random() < 0.65, bars: rnd([8, 8, 12, 16]) };
    if (Math.random() < 0.4) key = rnd([0, 2, -3, 5, -2, -5, 3]);
    prog = rnd(PROGS);
    secBars = 0; phraseIdx = 0;
    motif = { rhy: rnd(RHY), contour: Array.from({ length: 8 }, () => rnd([-2, -1, -1, 1, 1, 2, 0, 3])) };
  }

  // 4 bars of melody. Phrases A A' B A'' reuse the section motif with variations.
  function newPhrase() {
    const notes = [];
    const variant = phraseIdx % 4 === 2;
    const contour = variant ? motif.contour.map(c => -c) : motif.contour.slice();
    if (!variant && Math.random() < 0.35) contour[Math.floor(Math.random() * 8)] = rnd([-2, -1, 1, 2]);
    let deg = rnd([2, 4, 4, 7]);
    for (let b = 0; b < 4; b++) {
      const rhy = b === 3 ? rnd(CAD) : (b === 2 || variant) ? rnd(RHY) : motif.rhy;
      const root = prog[b];
      rhy.forEach(([s, l], i) => {
        if (b === 3 && i === rhy.length - 1) deg = nearestChordTone(deg, root);
        else if (s === 0 || s === 4) deg = nearestChordTone(deg + contour[i % 8], root);
        else deg += contour[(i + b) % 8] || 1;
        while (deg > 9) deg -= 2;
        while (deg < -2) deg += 2;
        if (section.type === 'call' && b % 2 === 1 && i > 0 && Math.random() < 0.6) return; // leave space
        notes.push({ at: b * 8 + s, len: l, deg });
      });
    }
    phrase = notes; phraseIdx++;
  }

  function playInstr(name, f, dur, t) {
    const d = musicBus;
    if (name === 'box') { tone(f, dur + 0.9, { vol: 0.085, dest: d, t }); tone(f * 2, 0.35, { vol: 0.02, dest: d, t }); tone(f * 4, 0.12, { vol: 0.008, dest: d, t }); }
    if (name === 'flute') { tone(f, dur + 0.15, { vol: 0.07, attack: 0.07, vibrato: 0.006, pad: true, dest: d, t }); tone(f * 2, dur, { vol: 0.008, attack: 0.08, pad: true, dest: d, t }); }
    if (name === 'marimba') { tone(f, 0.55, { vol: 0.11, dest: d, t }); tone(f * 4, 0.07, { vol: 0.02, dest: d, t }); }
    if (name === 'pluck') { tone(f, dur + 0.35, { type: 'triangle', vol: 0.075, dest: d, t }); }
    if (name === 'bell') { tone(f, 1.4, { vol: 0.06, dest: d, t }); tone(f * 2.76, 0.4, { vol: 0.012, dest: d, t }); tone(f * 5.4, 0.15, { vol: 0.005, dest: d, t }); }
  }

  function playStep(t) {
    const e = 60 / (mood === 'out' ? 100 : 82) / 2;
    if (step === 0 && moodChanged) { moodChanged = false; bar = 0; section = null; }
    if (bar === 0 && step === 0) {
      if (!section || secBars >= section.bars) newSection();
      newPhrase();
    }
    const h = t + Math.random() * 0.012;
    const root = prog[bar], d = musicBus, type = section.type;
    // soft pad chord
    if (step === 0 && type !== 'bouncy') for (const c of [root, root + 2, root + 4]) tone(hz(midi(c, 60)), e * 8, { vol: 0.02, attack: 0.5, pad: true, dest: d, t });
    // bass
    if (type !== 'soft') {
      if (step === 0) tone(hz(midi(root, 48)), e * 3.5, { type: 'triangle', vol: 0.09, dest: d, t });
      if (step === 4 && Math.random() < 0.85) tone(hz(midi(root + (Math.random() < 0.5 ? 4 : 0), 48)), e * 3, { type: 'triangle', vol: 0.07, dest: d, t });
      if (type === 'bouncy' && (step === 2 || step === 6)) tone(hz(midi(root + 2, 48)), e * 0.9, { type: 'triangle', vol: 0.05, dest: d, t });
    }
    // music-box arpeggio
    if (section.arp && (type === 'soft' || step % 2 === 1)) {
      const seq = type === 'soft' ? [0, 2, 4, 7, 9, 7, 4, 2] : [0, 2, 4, 7, 4, 2, 4, 7];
      const m = midi(root + seq[step], 72);
      tone(hz(m), e * 3, { vol: type === 'soft' ? 0.04 : 0.022, dest: d, t: h });
      tone(hz(m) * 2, e, { vol: 0.006, dest: d, t: h });
    }
    // melody
    if (type !== 'soft') for (const n of phrase) if (n.at === bar * 8 + step) playInstr(section.instr, hz(midi(n.deg, 72)), n.len * e, h);
    // light percussion outdoors
    if (mood === 'out' && (type === 'full' || type === 'bouncy')) {
      noise(0.04, { vol: step % 2 ? 0.012 : 0.022, freq: 7000, q: 1.5, type: 'highpass', dest: d, t: h });
      if (step === 0 || (type === 'bouncy' && step === 4)) tone(95, 0.2, { vol: 0.12, slide: 0.5, dest: d, t });
    }
    step++;
    if (step === 8) { step = 0; bar++; secBars++; if (bar === 4) bar = 0; }
    nextT += e;
  }

  function schedule() {
    if (!ac || ac.state !== 'running') return;
    updateGain();
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.15) playStep(nextT);
  }

  // A little tune played by the game (lullaby etc.). pairs: [freq, beats]
  function song(pairs, bpm, instr = 'box') {
    if (!ac) return 0;
    const b = 60 / bpm; let t = ac.currentTime + 0.05, total = 0;
    for (const [f, beats] of pairs) {
      if (f) {
        if (instr === 'box') { tone(f, beats * b + 0.8, { vol: 0.14, t }); tone(f * 2, 0.4, { vol: 0.025, t }); }
        else tone(f, beats * b + 0.3, { type: 'triangle', vol: 0.13, t });
      }
      t += beats * b; total += beats * b;
    }
    duck(total + 1);
    return total;
  }

  const N = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, B5: 988, C6: 1047 };

  return {
    init,
    step(surface) {
      if (surface === 'gravel') noise(0.08, { vol: 0.09, freq: 3000 + Math.random() * 1500, q: 0.8 });
      else if (surface === 'wood') noise(0.05, { vol: 0.07, freq: 500 + Math.random() * 200, q: 3 });
      else noise(0.05, { vol: 0.04, freq: 800 + Math.random() * 300, q: 2 });
    },
    bell() {
      for (const d of [0, 0.2]) {
        tone(2093, 0.9, { vol: 0.11, delay: d });
        tone(2637, 0.7, { vol: 0.05, delay: d });
        tone(4186, 0.25, { vol: 0.03, delay: d });
      }
    },
    door() { tone(190, 0.25, { type: 'triangle', vol: 0.14, slide: 0.6 }); noise(0.15, { vol: 0.06, freq: 400 }); },
    pop() { tone(420, 0.16, { vol: 0.18, slide: 2.4 }); },
    boing() { tone(260, 0.3, { type: 'triangle', vol: 0.14, slide: 2.2 }); },
    meow() {
      tone(760, 0.5, { type: 'triangle', vol: 0.09, slide: 0.55, attack: 0.06 });
      tone(1140, 0.35, { vol: 0.04, slide: 0.7, attack: 0.06 });
    },
    squeak() {
      tone(1400, 0.12, { type: 'square', vol: 0.04, slide: 1.4 });
      tone(1650, 0.12, { type: 'square', vol: 0.035, slide: 1.3, delay: 0.13 });
    },
    yum() { [523, 659, 784].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.12, delay: i * 0.08 })); },
    ding() { tone(1568, 1.0, { vol: 0.12 }); tone(3136, 0.4, { vol: 0.03 }); },
    note(f) { duck(1.8); tone(f, 1.3, { type: 'triangle', vol: 0.17 }); tone(f * 2, 0.6, { vol: 0.05 }); },
    drum() { tone(130, 0.45, { vol: 0.45, slide: 0.4 }); noise(0.12, { vol: 0.12, freq: 250, type: 'lowpass' }); },
    xylo() { duck(1.6); [523, 587, 659, 784, 880, 1047].forEach((f, i) => tone(f, 0.6, { vol: 0.14, delay: i * 0.09 })); },
    crackle() { for (let i = 0; i < 6; i++) noise(0.03, { vol: 0.1, freq: 1500 + Math.random() * 2000, delay: Math.random() * 0.4 }); },
    melody(notes, gap = 0.22) {
      duck(notes.length * gap + 1);
      notes.forEach((f, i) => f && tone(f, 0.4, { type: 'triangle', vol: 0.13, delay: i * gap }));
    },
    // Brahms' lullaby on a music box; returns its length in seconds
    lullaby() {
      const n = N;
      const dur = song([[n.E5, .5], [n.E5, .5], [n.G5, 2], [n.E5, .5], [n.E5, .5], [n.G5, 2], [n.E5, .5], [n.G5, .5], [n.C6, 1], [n.B5, 1.5], [n.A5, .5], [n.A5, 1], [n.G5, 1],
        [n.D5, .5], [n.E5, .5], [n.F5, 1], [n.D5, 1], [n.D5, .5], [n.E5, .5], [n.F5, 2], [n.D5, .5], [n.F5, .5], [n.B5, .5], [n.A5, .5], [n.G5, 1], [n.B5, 1], [n.C6, 3]], 84);
      if (ac) {
        const b = 60 / 84, t = ac.currentTime + 0.05;
        [[131, 0, 6], [131, 6, 6], [196, 12, 6], [131, 18, 7]].forEach(([f, at, len]) => tone(f, len * b, { vol: 0.05, attack: 0.3, pad: true, t: t + at * b }));
      }
      return dur;
    },
    // one blow of the jackhammer; called ~14 times a second while it runs
    jackhammer(vol) {
      noise(0.05, { vol, freq: 650 + Math.random() * 350, q: 0.7 });
      tone(52 + Math.random() * 8, 0.05, { type: 'square', vol: vol * 0.3 });
    },
    // the tick of a German pedestrian light, a bit brighter on green
    tick(vol, go) { tone(go ? 1250 : 950, 0.025, { type: 'square', vol: vol * 0.35 }); noise(0.02, { vol, freq: 2600, q: 3 }); },
    press() { noise(0.03, { vol: 0.12, freq: 1800, q: 2 }); tone(1500, 0.06, { type: 'square', vol: 0.03, delay: 0.02 }); },
    hello() { tone(196, 0.22, { type: 'triangle', vol: 0.16, slide: 1.25, attack: 0.03 }); tone(247, 0.3, { type: 'triangle', vol: 0.16, slide: 0.85, attack: 0.03, delay: 0.24 }); },
    // slide whistle going down
    wheee() { tone(1400, 0.7, { vol: 0.09, slide: 0.3, attack: 0.04, vibrato: 0.02 }); tone(700, 0.7, { type: 'triangle', vol: 0.05, slide: 0.3, attack: 0.04 }); },
    yay() { playClip('yay'); },
    chirp() { [0, 0.18, 0.3].forEach(d => tone(2300 + Math.random() * 600, 0.12, { vol: 0.05, slide: 1.35, delay: d })); },
    sparkle() { [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, 0.35, { vol: 0.045, delay: i * 0.06 })); },
    setMood(m) { if (m !== mood) { mood = m; moodChanged = true; } },
    hold(on) { hold = on; if (ac) updateGain(); },
    toggleMusic() { musicOn = !musicOn; if (ac) updateGain(); return musicOn; },
  };
})();
