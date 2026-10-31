/**
 * Procedural Web Audio synthesizer featuring multi-layered dark-synth / chiptune
 * "tuff beats" (punchy 808/kick drums, crispy snare, 16th-note hi-hats, sub-basslines,
 * chord pads, and arpeggiated leads) plus combat & Soul Focus SFX.
 */

const TRACKS = Object.freeze({
  exploration: {
    stepDuration: 0.145,
    melody: [
      329.63, 0, 392.00, 493.88, 659.25, 0, 587.33, 493.88,
      392.00, 493.88, 587.33, 0, 493.88, 392.00, 329.63, 293.66,
      261.63, 0, 329.63, 392.00, 523.25, 0, 493.88, 392.00,
      293.66, 369.99, 440.00, 587.33, 523.25, 493.88, 392.00, 329.63
    ],
    bass: [
      82.41, 82.41, 164.81, 82.41, 73.42, 73.42, 146.83, 73.42,
      65.41, 65.41, 130.81, 65.41, 61.74, 61.74, 73.42, 82.41
    ],
    drums: [
      "K", "H", "H", "K", "S", "H", "K", "H",
      "K", "K", "H", "H", "S", "H", "K", "S"
    ],
    leadType: "triangle",
    bassType: "sawtooth"
  },
  bastion: {
    stepDuration: 0.13,
    melody: [
      293.66, 349.23, 440.00, 0, 587.33, 523.25, 440.00, 349.23,
      261.63, 329.63, 392.00, 0, 523.25, 493.88, 392.00, 329.63,
      233.08, 293.66, 349.23, 466.16, 587.33, 466.16, 349.23, 293.66,
      220.00, 277.18, 329.63, 440.00, 554.37, 659.25, 554.37, 440.00
    ],
    bass: [
      73.42, 73.42, 146.83, 73.42, 65.41, 65.41, 130.81, 65.41,
      58.27, 58.27, 116.54, 58.27, 55.00, 55.00, 110.00, 69.30
    ],
    drums: [
      "K", "H", "K", "H", "S", "H", "K", "K",
      "K", "H", "K", "H", "S", "K", "S", "H"
    ],
    leadType: "square",
    bassType: "sawtooth"
  },
  labyrinth: {
    stepDuration: 0.135,
    melody: [
      246.94, 293.66, 369.99, 493.88, 0, 440.00, 369.99, 293.66,
      220.00, 261.63, 329.63, 440.00, 0, 392.00, 329.63, 261.63,
      196.00, 246.94, 293.66, 392.00, 493.88, 392.00, 293.66, 246.94,
      185.00, 246.94, 311.13, 369.99, 493.88, 440.00, 369.99, 311.13
    ],
    bass: [
      61.74, 123.47, 61.74, 61.74, 55.00, 110.00, 55.00, 55.00,
      49.00, 98.00, 49.00, 49.00, 46.25, 92.50, 55.00, 61.74
    ],
    drums: [
      "K", "H", "H", "K", "S", "H", "K", "H",
      "K", "H", "K", "K", "S", "H", "H", "S"
    ],
    leadType: "triangle",
    bassType: "sawtooth"
  },
  boss: {
    stepDuration: 0.112,
    melody: [
      329.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63,
      369.99, 369.99, 440.00, 554.37, 587.33, 554.37, 440.00, 369.99,
      392.00, 493.88, 587.33, 659.25, 783.99, 659.25, 587.33, 493.88,
      311.13, 392.00, 466.16, 622.25, 740.00, 622.25, 493.88, 392.00
    ],
    bass: [
      82.41, 82.41, 164.81, 82.41, 92.50, 92.50, 185.00, 92.50,
      98.00, 98.00, 196.00, 98.00, 77.78, 77.78, 155.56, 82.41
    ],
    drums: [
      "K", "H", "K", "H", "S", "K", "H", "K",
      "K", "K", "H", "K", "S", "H", "S", "K"
    ],
    leadType: "sawtooth",
    bassType: "sawtooth"
  }
});

export class SoundEngine {
  constructor(initialMuted = false) {
    this.ctx = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.musicStarted = false;
    this.muted = initialMuted;
    this.duckMusic = false;
    this.currentTrackKey = "exploration";
    this.musicStep = 0;
    this.musicTimer = null;
  }

  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);
      this.createNoiseBuffer();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (this.ctx && !this.musicStarted) {
      this.startMusicLoop();
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
    }
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  setTrack(trackKey) {
    if (TRACKS[trackKey] && this.currentTrackKey !== trackKey) {
      this.currentTrackKey = trackKey;
      this.musicStep = 0;
      if (this.musicStarted) {
        this.startMusicLoop();
      }
    }
  }

  triggerDrum(type, now) {
    if (!this.ctx || !this.masterGain) return;
    if (type === "K") {
      // Punchy 808 / Synth Kick Drum
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(34, now + 0.11);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "S") {
      // Crispy Synth Snare (body + filtered noise snap)
      const osc = this.ctx.createOscillator();
      const oGain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(195, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.07);
      oGain.gain.setValueAtTime(0.09, now);
      oGain.gain.exponentialRampToValueAtTime(0.004, now + 0.075);
      osc.connect(oGain);
      oGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.075);

      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1100, now);
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.085, now);
        nGain.gain.exponentialRampToValueAtTime(0.003, now + 0.09);
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.09);
      }
    } else if (type === "H" && this.noiseBuffer) {
      // Crisp 16th-note Hi-Hat
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(5200, now);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.032, now);
      nGain.gain.exponentialRampToValueAtTime(0.002, now + 0.035);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.035);
    }
  }

  startMusicLoop() {
    this.musicStarted = true;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
    }

    const track = TRACKS[this.currentTrackKey] || TRACKS.exploration;
    const stepDuration = track.stepDuration;

    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.ctx.state !== "running") return;
      if (this.muted || this.duckMusic) return;

      const activeTrack = TRACKS[this.currentTrackKey] || TRACKS.exploration;
      const dur = activeTrack.stepDuration;
      const now = this.ctx.currentTime;
      const step = this.musicStep++;

      // 1. Percussion groove (Kick, Snare, Hats)
      const drumHit = activeTrack.drums[step % activeTrack.drums.length];
      if (drumHit) {
        this.triggerDrum(drumHit, now);
      }

      // 2. Driving filtered sub-bassline on 8th notes
      if (step % 2 === 0) {
        const bassFreq = activeTrack.bass[Math.floor(step / 2) % activeTrack.bass.length];
        if (bassFreq) {
          const bOsc = this.ctx.createOscillator();
          const bFilter = this.ctx.createBiquadFilter();
          const bGain = this.ctx.createGain();
          bOsc.type = activeTrack.bassType || "sawtooth";
          bOsc.frequency.setValueAtTime(bassFreq, now);
          bFilter.type = "lowpass";
          bFilter.frequency.setValueAtTime(420, now);
          bFilter.frequency.exponentialRampToValueAtTime(140, now + dur * 1.8);
          bGain.gain.setValueAtTime(0.075, now);
          bGain.gain.exponentialRampToValueAtTime(0.005, now + dur * 1.9);
          bOsc.connect(bFilter);
          bFilter.connect(bGain);
          bGain.connect(this.masterGain);
          bOsc.start(now);
          bOsc.stop(now + dur * 1.95);
        }
      }

      // 3. Arpeggiated synth lead + detuned shimmer
      const leadFreq = activeTrack.melody[step % activeTrack.melody.length];
      if (leadFreq && leadFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = activeTrack.leadType;
        osc.frequency.setValueAtTime(leadFreq, now);
        const peakGain =
          activeTrack.leadType === "sawtooth" || activeTrack.leadType === "square"
            ? 0.026
            : 0.04;
        gain.gain.setValueAtTime(peakGain, now);
        gain.gain.exponentialRampToValueAtTime(0.002, now + dur * 0.92);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + dur * 0.96);
      }
    }, stepDuration * 1000);
  }

  createNoiseBuffer() {
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  canPlay() {
    return !!(this.ctx && this.masterGain && !this.muted);
  }

  playMenuMove() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.045);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.045);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  playMenuSelect() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    [523.25, 783.99].forEach((freq, i) => {
      const t = now + i * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.09);
    });
  }

  playJump() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(490, now + 0.11);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.11);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playWallJump() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playDash() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1250, now);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.14);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.14);
  }

  playSwing(comboStep = 0) {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(850 + comboStep * 260, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15 + comboStep * 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.08);

    // Extra metallic resonance on 3rd-hit Solar Finisher
    if (comboStep === 2) {
      const osc = this.ctx.createOscillator();
      const oGain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.11);
      oGain.gain.setValueAtTime(0.12, now);
      oGain.gain.exponentialRampToValueAtTime(0.005, now + 0.11);
      osc.connect(oGain);
      oGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  }

  playHit(isFinisher = false) {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(isFinisher ? 440 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.095);
    oscGain.gain.setValueAtTime(isFinisher ? 0.44 : 0.34, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.095);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.095);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(1.2, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.07);
  }

  playWaveCast() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(780, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playFocusTick(progressRatio = 0) {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const baseFreq = 320 + progressRatio * 440;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.12, now + 0.07);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.004, now + 0.075);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  playHeal() {
    if (!this.canPlay()) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.24);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  playDefeatPop() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playPickup() {
    if (!this.canPlay()) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.065;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.008, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.18);
    });
  }

  playHurt() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.14);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playHeartCrack() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(3.0, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.08);

    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    oGain.gain.setValueAtTime(0.2, now);
    oGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(oGain);
    oGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playHeartShatter() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1100, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.32);

    const notes = [620, 480, 340, 210];
    notes.forEach((f, idx) => {
      const t = now + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.1);
      g.gain.setValueAtTime(0.16, t);
      g.gain.exponentialRampToValueAtTime(0.008, t + 0.1);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  playCheckpoint() {
    if (!this.canPlay()) return;
    const notes = [329.63, 440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.28);
    });
  }

  playKeyPickup() {
    if (!this.canPlay()) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.17, now);
      gain.gain.exponentialRampToValueAtTime(0.008, now + 0.16);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    });
  }

  playBossRoar() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.35);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  playVictoryFanfare() {
    if (!this.canPlay()) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.006, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }
}
