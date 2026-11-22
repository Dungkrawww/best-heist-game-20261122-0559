// audio.js — every sound is synthesised with WebAudio: no audio files,
// no network. One file, one job: the heist's bleeps and chimes.

export function createAudio() {
  return { ctx: null, muted: false };
}

// Browsers only let sound start after a gesture; call this from the first
// key press or click.
export function unlockAudio(audio) {
  if (audio.ctx) {
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return;
  }
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audio.ctx = new Ctx();
  } catch (_e) {
    audio.ctx = null;
  }
}

function beep(audio, freq, seconds, type, gainValue, when = 0) {
  if (!audio.ctx || audio.muted) return;
  const t0 = audio.ctx.currentTime + when;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(gainValue, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(gain);
  gain.connect(audio.ctx.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.02);
}

export function playPickup(audio) {
  beep(audio, 880, 0.12, 'sine', 0.12);
  beep(audio, 1318, 0.18, 'sine', 0.1, 0.09);
}

export function playSpotted(audio) {
  beep(audio, 196, 0.22, 'square', 0.06);
  beep(audio, 147, 0.3, 'square', 0.06, 0.12);
}

export function playCoin(audio) {
  beep(audio, 1567, 0.07, 'triangle', 0.08);
}

export function playSmoke(audio) {
  beep(audio, 320, 0.3, 'sine', 0.07);
  beep(audio, 210, 0.35, 'sine', 0.05, 0.1);
}

export function playEmp(audio) {
  beep(audio, 1200, 0.1, 'sawtooth', 0.05);
  beep(audio, 300, 0.25, 'sawtooth', 0.05, 0.08);
}

export function playCaught(audio) {
  beep(audio, 220, 0.35, 'sawtooth', 0.1);
  beep(audio, 110, 0.6, 'sawtooth', 0.1, 0.25);
}

export function playEscape(audio) {
  beep(audio, 523, 0.15, 'sine', 0.12);
  beep(audio, 659, 0.15, 'sine', 0.12, 0.13);
  beep(audio, 784, 0.3, 'sine', 0.12, 0.26);
}
