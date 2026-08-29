/**
 * 1920s Gramophone Vinyl Crackle & Rain Ambience Generator
 * Built using native Web Audio API (zero external assets required).
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private crackleInterval: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
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
    this.masterGain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
    this.masterGain.connect(this.ctx.destination);

    // 1. Rain / Muffled street noise (Brown/Pink noise buffer)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // boost rain volume
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Filter for muffled rain outside 1920s Georgian window
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(850, now);

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
      if (Math.random() > 0.4) {
        const osc = this.ctx.createOscillator();
        const crackleGain = this.ctx.createGain();
        const crackleFilter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40 + Math.random() * 120, this.ctx.currentTime);

        crackleFilter.type = 'highpass';
        crackleFilter.frequency.setValueAtTime(2000 + Math.random() * 3000, this.ctx.currentTime);

        const time = this.ctx.currentTime;
        crackleGain.gain.setValueAtTime(0.08 + Math.random() * 0.09, time);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03 + Math.random() * 0.04);

        osc.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.08);
      }
    }, 120);
  }

  public stop() {
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
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
      }, 650);
    } else {
      this.isPlaying = false;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundEngine();
