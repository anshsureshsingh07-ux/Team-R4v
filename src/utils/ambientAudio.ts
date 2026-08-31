/**
 * 1920s Gramophone Vinyl Crackle, Rain Ambience & Micro-Interaction Audio Synthesizer
 * Built using native Web Audio API (zero external assets, 0ms network latency).
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private crackleInterval: number | null = null;
  private isMuted: boolean = false;

  public init() {
    if (!this.ctx) {
      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtxClass();
      } catch {
        // Web Audio not supported
      }
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Master Gain for smooth fade in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.16, now + 1.0);
    this.masterGain.connect(this.ctx.destination);

    // 1. Rain / Muffled street noise (Brown/Pink noise buffer)
    const bufferSize = Math.min(this.ctx.sampleRate * 2, 88200);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.2; // boost rain volume
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Filter for muffled rain outside 1920s Georgian window
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(800, now);

    this.noiseNode.connect(rainFilter);
    rainFilter.connect(this.masterGain);
    this.noiseNode.start(0);

    // 2. Vinyl needle crackle simulator
    this.startCrackle();
  }

  private startCrackle() {
    if (!this.ctx || !this.masterGain) return;

    this.crackleInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      if (Math.random() > 0.45) {
        const osc = this.ctx.createOscillator();
        const crackleGain = this.ctx.createGain();
        const crackleFilter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40 + Math.random() * 100, this.ctx.currentTime);

        crackleFilter.type = 'highpass';
        crackleFilter.frequency.setValueAtTime(2000 + Math.random() * 2500, this.ctx.currentTime);

        const time = this.ctx.currentTime;
        crackleGain.gain.setValueAtTime(0.06 + Math.random() * 0.06, time);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03 + Math.random() * 0.03);

        osc.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.06);
      }
    }, 140);
  }

  public stop() {
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      setTimeout(() => {
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch {}
          this.noiseNode.disconnect();
          this.noiseNode = null;
        }
        if (this.crackleInterval) {
          clearInterval(this.crackleInterval);
          this.crackleInterval = null;
        }
        this.isPlaying = false;
      }, 550);
    } else {
      this.isPlaying = false;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  // --- Tactile Micro-Interaction Sound Effects ---

  public playClick(pitch: number = 900) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  public playStamp() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignore
    }
  }

  public playTelegraph() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  public playTypewriterKey() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const pitch = 700 + Math.random() * 250;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.3, now + 0.035);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(500, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore
    }
  }

  public playDownloadChime() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }
}

export const ambientSound = new AmbientSoundEngine();
