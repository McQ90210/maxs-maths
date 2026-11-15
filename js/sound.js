// All sounds are made live with Web Audio, so there are no sound files to load.
let ctx = null;
let muted = false;
try { muted = localStorage.getItem('rr_muted') === '1'; } catch (e) { /* storage blocked */ }

export function isMuted() { return muted; }
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('rr_muted', m ? '1' : '0'); } catch (e) { /* ignore */ }
}

// iPad needs a tap before audio can start.
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function out(gain = 0.5) {
  const g = ctx.createGain();
  g.gain.value = gain;
  g.connect(ctx.destination);
  return g;
}

function noiseBuffer(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function ready() { if (muted) return false; unlock(); return !!ctx; }

export function tap() {
  if (!ready()) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = out(0);
  o.type = 'triangle'; o.frequency.value = 660;
  o.connect(g);
  g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.start(t); o.stop(t + 0.07);
}

export function chime() {
  if (!ready()) return;
  const t = ctx.currentTime;
  [1046.5, 1568, 2093].forEach((f, i) => {
    const o = ctx.createOscillator(), g = out(0);
    o.type = 'sine'; o.frequency.value = f; o.connect(g);
    const s = t + i * 0.08;
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.18, s + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.9);
    o.start(s); o.stop(s + 1);
  });
}

export function whistle(blasts = 1) {
  if (!ready()) return;
  const t0 = ctx.currentTime;
  for (let b = 0; b < blasts; b++) {
    const t = t0 + b * 0.45, len = b === blasts - 1 ? 0.55 : 0.25;
    const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = out(0);
    o.type = 'sine'; o.frequency.value = 2900;
    lfo.frequency.value = 32; lg.gain.value = 160;
    lfo.connect(lg); lg.connect(o.frequency); o.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    g.gain.setValueAtTime(0.2, t + len - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.start(t); lfo.start(t); o.stop(t + len + 0.05); lfo.stop(t + len + 0.05);
  }
}

// Crowd cheer: shaped noise with a roar that swells and fades.
export function cheer(seconds = 2.2) {
  if (!ready()) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(seconds);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 0.6;
  const g = out(0);
  src.connect(bp); bp.connect(g);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.45, t + 0.25);
  g.gain.setValueAtTime(0.45, t + seconds * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  bp.frequency.setValueAtTime(900, t); bp.frequency.linearRampToValueAtTime(1500, t + 0.4);
  src.start(t); src.stop(t + seconds);
  // a few "voices" for warmth
  for (let i = 0; i < 6; i++) {
    const o = ctx.createOscillator(), og = out(0), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    o.type = 'sawtooth'; o.frequency.value = 220 + Math.random() * 180;
    o.frequency.linearRampToValueAtTime(o.frequency.value * 1.25, t + 0.4);
    o.connect(lp); lp.connect(og);
    og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.025, t + 0.2);
    og.gain.exponentialRampToValueAtTime(0.0001, t + seconds * 0.8);
    o.start(t); o.stop(t + seconds);
  }
}

// Crowd "ooh", like a near miss: low voices that rise then fall, with soft noise.
export function ooh() {
  if (!ready()) return;
  const t = ctx.currentTime, len = 1.3;
  for (let i = 0; i < 8; i++) {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = out(0);
    lp.type = 'lowpass'; lp.frequency.value = 650;
    o.type = 'sawtooth';
    const f = 150 + Math.random() * 90;
    o.frequency.setValueAtTime(f, t);
    o.frequency.linearRampToValueAtTime(f * 1.35, t + 0.35);
    o.frequency.linearRampToValueAtTime(f * 0.9, t + len);
    o.connect(lp); lp.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.start(t); o.stop(t + len);
  }
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(len);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 1;
  const g = out(0); src.connect(bp); bp.connect(g);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.2);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.start(t); src.stop(t + len);
}

export function kick() {
  if (!ready()) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = out(0);
  o.type = 'sine'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  o.connect(g); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.start(t); o.stop(t + 0.16);
}
