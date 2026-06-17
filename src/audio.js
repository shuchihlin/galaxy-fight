// All sound is synthesized at runtime via the Web Audio API — no audio
// files. SFX are short oscillator/noise bursts; music is a small looping
// chiptune sequence. A singleton mirrors the input module.

const MASTER_GAIN = 0.22;
const STEP = 0.16; // music step length (seconds)
// Original 8-step loop (A-minor-ish), nothing copied.
const BASS = [110, 110, 165, 110, 98, 98, 147, 98];
const ARP = [440, 523, 659, 523, 392, 494, 587, 494];

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.musicOn = false;
    this._musicTimer = null;
  }

  // Create the AudioContext (must follow a user gesture in most browsers).
  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : MASTER_GAIN;
    this.master.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : MASTER_GAIN;
    return this.muted;
  }

  // A single enveloped oscillator note.
  tone({ type = 'square', freq = 440, dur = 0.1, gain = 0.3, freqEnd = null, delay = 0 }) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // A filtered white-noise burst (for explosions).
  noise({ dur = 0.2, gain = 0.3, delay = 0, filterFreq = 1500 }) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t0);
  }

  // --- Named sound effects ---
  shoot() {
    this.tone({ type: 'square', freq: 880, freqEnd: 220, dur: 0.12, gain: 0.16 });
  }
  explosion() {
    this.noise({ dur: 0.35, gain: 0.4, filterFreq: 1800 });
    this.tone({ type: 'sawtooth', freq: 160, freqEnd: 40, dur: 0.35, gain: 0.2 });
  }
  smallHit() {
    this.tone({ type: 'square', freq: 330, freqEnd: 120, dur: 0.08, gain: 0.14 });
  }
  dive() {
    this.tone({ type: 'triangle', freq: 220, freqEnd: 620, dur: 0.28, gain: 0.1 });
  }
  capture() {
    for (let i = 0; i < 6; i++) {
      this.tone({ type: 'sine', freq: 300 + i * 70, freqEnd: 420 + i * 70, dur: 0.18, gain: 0.1, delay: i * 0.12 });
    }
  }
  rescue() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.tone({ type: 'square', freq: f, dur: 0.12, gain: 0.18, delay: i * 0.09 })
    );
  }
  stageStart() {
    [392, 523, 659].forEach((f, i) =>
      this.tone({ type: 'square', freq: f, dur: 0.14, gain: 0.16, delay: i * 0.12 })
    );
  }
  gameOver() {
    [392, 330, 262, 196].forEach((f, i) =>
      this.tone({ type: 'sawtooth', freq: f, dur: 0.3, gain: 0.18, delay: i * 0.18 })
    );
  }

  // --- Looping background music ---
  startMusic() {
    if (!this.ctx || this.musicOn) return;
    this.musicOn = true;
    this._bar();
  }

  _bar() {
    if (!this.musicOn) return;
    for (let i = 0; i < 8; i++) {
      this.tone({ type: 'triangle', freq: BASS[i], dur: STEP * 0.9, gain: 0.1, delay: i * STEP });
      this.tone({ type: 'square', freq: ARP[i], dur: STEP * 0.5, gain: 0.05, delay: i * STEP });
    }
    this._musicTimer = setTimeout(() => this._bar(), 8 * STEP * 1000);
  }

  stopMusic() {
    this.musicOn = false;
    if (this._musicTimer) clearTimeout(this._musicTimer);
    this._musicTimer = null;
  }
}

export const audio = new AudioManager();
