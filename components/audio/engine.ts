'use client';

/**
 * A generative ambient score, synthesized live with the Web Audio API.
 *
 * Three voices — a slow warm pad, sparse santoor-like plucks, and rare
 * high chimes — drift over a soft drone. Nothing is sampled, nothing is
 * downloaded; the whole soundtrack weighs nothing and never repeats.
 */

type Sfx = 'chime' | 'seal' | 'paper' | 'sparkle' | 'bloom';

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]; // C maj pentatonic
const CHORDS: number[][] = [
  [130.81, 196.0, 261.63, 329.63], // C
  [110.0, 164.81, 261.63, 329.63], // Am
  [87.31, 174.61, 261.63, 349.23], // F
  [98.0, 196.0, 293.66, 392.0], // G
];

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private delay: DelayNode | null = null;
  private padOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private chordIndex = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private _playing = false;

  get playing() {
    return this._playing;
  }

  private ensure() {
    if (this.ctx) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);

    // a feedback delay gives every voice a long, soft hall
    this.delay = this.ctx.createDelay(2);
    this.delay.delayTime.value = 0.42;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.38;
    const damp = this.ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 2400;
    this.delay.connect(feedback);
    feedback.connect(damp);
    damp.connect(this.delay);
    const wet = this.ctx.createGain();
    wet.gain.value = 0.5;
    this.delay.connect(wet);
    wet.connect(this.master);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicBus.connect(this.master);
    this.musicBus.connect(this.delay);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.5;
    this.sfxBus.connect(this.master);
    this.sfxBus.connect(this.delay);
  }

  /** Fade the score in over ~2.5 s. Must be called from a user gesture. */
  start() {
    this.ensure();
    if (!this.ctx || !this.musicBus) return;
    void this.ctx.resume();
    if (this._playing) return;
    this._playing = true;

    const t = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(t);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t);
    this.musicBus.gain.linearRampToValueAtTime(0.28, t + 2.5);

    this.buildPad();
    this.schedulePluck(1200);
    this.scheduleChime(9000);
    this.scheduleChordDrift();
  }

  /** Fade out over ~2 s and quiet the generators. */
  stop() {
    if (!this.ctx || !this.musicBus || !this._playing) return;
    this._playing = false;
    const t = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(t);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t);
    this.musicBus.gain.linearRampToValueAtTime(0, t + 2);
    this.timers.forEach(clearTimeout);
    this.timers = [];
    const oscs = this.padOscs;
    this.padOscs = [];
    setTimeout(() => oscs.forEach(({ osc }) => { try { osc.stop(); } catch { /* already stopped */ } }), 2200);
  }

  private buildPad() {
    if (!this.ctx || !this.musicBus) return;
    this.padOscs.forEach(({ osc }) => { try { osc.stop(); } catch { /* noop */ } });
    this.padOscs = [];

    const chord = CHORDS[this.chordIndex % CHORDS.length];
    const t = this.ctx.currentTime;

    for (const freq of chord) {
      for (const detune of [-4, 4]) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = detune;

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 900;
        lp.Q.value = 0.4;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 4);

        // each partial breathes on its own slow cycle
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.05 + Math.random() * 0.06;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();

        osc.connect(lp);
        lp.connect(gain);
        gain.connect(this.musicBus);
        osc.start();
        this.padOscs.push({ osc, gain });
      }
    }
  }

  private scheduleChordDrift() {
    const drift = () => {
      if (!this._playing || !this.ctx) return;
      this.chordIndex += 1;
      const old = this.padOscs;
      const t = this.ctx.currentTime;
      old.forEach(({ osc, gain }) => {
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + 6);
        setTimeout(() => { try { osc.stop(); } catch { /* noop */ } }, 6500);
      });
      this.padOscs = [];
      this.buildPad();
      this.timers.push(setTimeout(drift, 14000 + Math.random() * 6000));
    };
    this.timers.push(setTimeout(drift, 14000));
  }

  /** A soft stringed pluck — half santoor, half harp. */
  private pluck(freq: number, when: number, vol = 0.14) {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const bright = this.ctx.createOscillator();
    bright.type = 'sine';
    bright.frequency.value = freq * 2.001;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 2.8);

    const brightGain = this.ctx.createGain();
    brightGain.gain.setValueAtTime(0, when);
    brightGain.gain.linearRampToValueAtTime(vol * 0.25, when + 0.008);
    brightGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.9);

    osc.connect(gain);
    bright.connect(brightGain);
    gain.connect(this.musicBus);
    brightGain.connect(this.musicBus);
    osc.start(when);
    bright.start(when);
    osc.stop(when + 3);
    bright.stop(when + 1);
  }

  private schedulePluck(delay: number) {
    const next = () => {
      if (!this._playing || !this.ctx) return;
      const note = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      const t = this.ctx.currentTime + 0.05;
      this.pluck(note, t);
      // occasionally answer with a soft third above, santoor-style
      if (Math.random() < 0.35) this.pluck(note * 1.5, t + 0.28, 0.07);
      this.timers.push(setTimeout(next, 2400 + Math.random() * 3800));
    };
    this.timers.push(setTimeout(next, delay));
  }

  private scheduleChime(delay: number) {
    const next = () => {
      if (!this._playing || !this.ctx) return;
      const base = [1046.5, 1174.66, 1318.5][Math.floor(Math.random() * 3)];
      const t = this.ctx.currentTime + 0.05;
      this.bell(base, t, 0.045, 5);
      this.timers.push(setTimeout(next, 16000 + Math.random() * 14000));
    };
    this.timers.push(setTimeout(next, delay));
  }

  private bell(freq: number, when: number, vol: number, dur: number, bus?: GainNode) {
    if (!this.ctx) return;
    const out = bus ?? this.musicBus;
    if (!out) return;
    for (const [ratio, amp] of [
      [1, 1],
      [2.76, 0.35],
      [5.4, 0.14],
    ] as const) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(vol * amp, when + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(gain);
      gain.connect(out);
      osc.start(when);
      osc.stop(when + dur + 0.1);
    }
  }

  /** One-shot interaction sounds. Silent until the context exists. */
  sfx(kind: Sfx) {
    if (!this.ctx || !this.sfxBus || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + 0.02;
    switch (kind) {
      case 'chime':
        this.bell(1318.5, t, 0.05, 3, this.sfxBus);
        break;
      case 'sparkle':
        this.bell(2093, t, 0.03, 1.6, this.sfxBus);
        this.bell(2637, t + 0.09, 0.02, 1.4, this.sfxBus);
        break;
      case 'bloom':
        this.pluck(523.25, t, 0.08);
        this.pluck(659.25, t + 0.12, 0.06);
        this.pluck(783.99, t + 0.26, 0.05);
        break;
      case 'seal': {
        // a felted low thump, like a seal pressed into wax
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(48, t + 0.22);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }
      case 'paper': {
        // filtered noise brushed briefly — a page turning
        const len = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(900, t);
        bp.frequency.exponentialRampToValueAtTime(2600, t + 0.3);
        bp.Q.value = 0.8;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        src.connect(bp);
        bp.connect(gain);
        gain.connect(this.sfxBus);
        src.start(t);
        break;
      }
    }
  }
}

export const ambient = new AmbientEngine();
