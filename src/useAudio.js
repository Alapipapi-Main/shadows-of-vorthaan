import { useRef, useEffect, useCallback, useState } from 'react';

// ── Procedural sound effects via Web Audio API ────────────────────────────────
function createCtx() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
}

function playTone(ctx, opts) {
  if (!ctx) return;
  const { freq = 440, type = 'sine', gain = 0.3, duration = 0.15, delay = 0, detune = 0, decay = true } = opts;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  osc.detune.setValueAtTime(detune, ctx.currentTime + delay);
  amp.gain.setValueAtTime(gain, ctx.currentTime + delay);
  if (decay) amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}

export const SOUNDS = {
  attack(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.4;
    playTone(ctx, { freq: 180, type: 'sawtooth', gain: g, duration: 0.08 });
    playTone(ctx, { freq: 120, type: 'square',   gain: g * 0.5, duration: 0.12, delay: 0.05 });
  },
  crit(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.5;
    playTone(ctx, { freq: 300, type: 'sawtooth', gain: g,       duration: 0.05 });
    playTone(ctx, { freq: 450, type: 'square',   gain: g * 0.7, duration: 0.12, delay: 0.04 });
    playTone(ctx, { freq: 600, type: 'sine',     gain: g * 0.4, duration: 0.18, delay: 0.1  });
  },
  hit(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.35;
    playTone(ctx, { freq: 100, type: 'square',   gain: g,       duration: 0.1  });
    playTone(ctx, { freq: 80,  type: 'sawtooth', gain: g * 0.6, duration: 0.15, delay: 0.05 });
  },
  heal(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.3;
    [523, 659, 784].forEach((f, i) =>
      playTone(ctx, { freq: f, type: 'sine', gain: g, duration: 0.2, delay: i * 0.1 })
    );
  },
  levelUp(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.35;
    [523, 659, 784, 1047].forEach((f, i) =>
      playTone(ctx, { freq: f, type: 'sine', gain: g, duration: 0.18, delay: i * 0.08 })
    );
  },
  victory(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.3;
    [523, 659, 784, 659, 1047].forEach((f, i) =>
      playTone(ctx, { freq: f, type: 'triangle', gain: g, duration: 0.22, delay: i * 0.1 })
    );
  },
  death(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.4;
    playTone(ctx, { freq: 220, type: 'sawtooth', gain: g,       duration: 0.5  });
    playTone(ctx, { freq: 110, type: 'square',   gain: g * 0.6, duration: 0.8, delay: 0.3 });
    playTone(ctx, { freq: 55,  type: 'sine',     gain: g * 0.4, duration: 1.2, delay: 0.7 });
  },
  purchase(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.25;
    playTone(ctx, { freq: 784, type: 'sine', gain: g,       duration: 0.1  });
    playTone(ctx, { freq: 988, type: 'sine', gain: g * 0.7, duration: 0.12, delay: 0.1 });
  },
  flee(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.3;
    [400, 350, 300, 250].forEach((f, i) =>
      playTone(ctx, { freq: f, type: 'sine', gain: g, duration: 0.08, delay: i * 0.06 })
    );
  },
  travel(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    const g = sfxVol * 0.2;
    playTone(ctx, { freq: 440, type: 'sine', gain: g,       duration: 0.1  });
    playTone(ctx, { freq: 550, type: 'sine', gain: g * 0.6, duration: 0.12, delay: 0.1 });
  },
  menuClick(ctx, sfxVol) {
    if (!ctx || sfxVol === 0) return;
    playTone(ctx, { freq: 660, type: 'sine', gain: sfxVol * 0.15, duration: 0.07 });
  },
};

// ── Procedural music via Web Audio API ───────────────────────────────────────
const TRACKS = {
  title: {
    bpm: 60,
    notes: [220, 246, 261, 293, 329, 261, 246, 220],
    type: 'triangle',
    baseGain: 0.12,
  },
  explore: {
    bpm: 80,
    notes: [196, 220, 246, 261, 220, 196, 174, 196],
    type: 'sine',
    baseGain: 0.1,
  },
  battle: {
    bpm: 140,
    notes: [110, 130, 110, 146, 110, 130, 98, 110],
    type: 'sawtooth',
    baseGain: 0.08,
  },
  boss: {
    bpm: 120,
    notes: [73, 82, 73, 87, 73, 82, 65, 73],
    type: 'square',
    baseGain: 0.07,
  },
};

class MusicPlayer {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.connect(ctx.destination);
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.track = null;
    this.noteIdx = 0;
    this.timer = null;
    this.volume = 0.5;
    this.running = false;
  }

  setVolume(v) {
    this.volume = v;
    this.masterGain.gain.setTargetAtTime(v === 0 ? 0 : v, this.ctx.currentTime, 0.1);
  }

  play(trackName) {
    this.stop();
    const def = TRACKS[trackName];
    if (!def) return;
    this.track = def;
    this.noteIdx = 0;
    this.running = true;
    this._tick();
  }

  _tick() {
    if (!this.running || !this.track) return;
    const def = this.track;
    const interval = (60 / def.bpm) * 1000;
    const freq = def.notes[this.noteIdx % def.notes.length];
    this.noteIdx++;

    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.connect(amp);
    amp.connect(this.masterGain);
    osc.type = def.type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    amp.gain.setValueAtTime(def.baseGain, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (interval / 1000) * 0.8);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + (interval / 1000) * 0.85);

    this.timer = setTimeout(() => this._tick(), interval);
  }

  stop() {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.track = null;
    this.noteIdx = 0;
  }

  fadeOut(cb) {
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    setTimeout(() => { this.stop(); if (cb) cb(); }, 1500);
  }

  crossfadeTo(trackName) {
    this.fadeOut(() => {
      if (!this.running) {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.6);
        this.play(trackName);
      }
    });
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
const MUSIC_VOL_KEY  = 'vorhaan_music_vol';
const SFX_VOL_KEY    = 'vorhaan_sfx_vol';

export function useAudio() {
  const ctxRef    = useRef(null);
  const musicRef  = useRef(null);
  const [musicVol, setMusicVolState] = useState(() => parseFloat(localStorage.getItem(MUSIC_VOL_KEY) ?? '0.5'));
  const [sfxVol,   setSfxVolState]   = useState(() => parseFloat(localStorage.getItem(SFX_VOL_KEY)   ?? '0.7'));
  const [ready,    setReady]         = useState(false);
  const currentTrack = useRef(null);

  // Initialise AudioContext on first user gesture
  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = createCtx();
    if (!ctx) return null;
    ctxRef.current = ctx;
    const player = new MusicPlayer(ctx);
    player.setVolume(musicVol);
    musicRef.current = player;
    setReady(true);
    return ctx;
  }, [musicVol]);

  const setMusicVol = useCallback((v) => {
    setMusicVolState(v);
    localStorage.setItem(MUSIC_VOL_KEY, String(v));
    musicRef.current?.setVolume(v);
  }, []);

  const setSfxVol = useCallback((v) => {
    setSfxVolState(v);
    localStorage.setItem(SFX_VOL_KEY, String(v));
  }, []);

  const playMusic = useCallback((trackName) => {
    const ctx = ensureCtx();
    if (!ctx || !musicRef.current) return;
    if (currentTrack.current === trackName) return;
    currentTrack.current = trackName;
    musicRef.current.crossfadeTo(trackName);
  }, [ensureCtx]);

  const stopMusic = useCallback(() => {
    musicRef.current?.fadeOut();
    currentTrack.current = null;
  }, []);

  const playSfx = useCallback((name, isBoss = false) => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const fn = SOUNDS[name];
    if (fn) fn(ctx, sfxVol);
  }, [ensureCtx, sfxVol]);

  // Cleanup
  useEffect(() => () => { musicRef.current?.stop(); }, []);

  return { musicVol, sfxVol, setMusicVol, setSfxVol, playMusic, stopMusic, playSfx, ready };
}
