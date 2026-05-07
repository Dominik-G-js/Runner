import { GameSettings } from '../data/settings';

type SoundName = 'click' | 'gatePositive' | 'gateNegative' | 'battle' | 'collect' | 'hit' | 'win' | 'lose';

export class AudioManager {
  private context: AudioContext | null = null;
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private settings: GameSettings;

  constructor(settings: GameSettings) {
    this.settings = settings;
  }

  updateSettings(settings: GameSettings): void {
    this.settings = settings;
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.musicVolume * 0.08;
    }
  }

  resume(): void {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    this.startMusic();
  }

  play(name: SoundName): void {
    const ctx = this.ensureContext();
    if (this.settings.sfxVolume <= 0) {
      return;
    }
    const profiles: Record<SoundName, [number, number, number]> = {
      click: [520, 0.04, 0.12],
      gatePositive: [740, 0.08, 0.2],
      gateNegative: [180, 0.12, 0.18],
      battle: [110, 0.06, 0.16],
      collect: [880, 0.04, 0.14],
      hit: [95, 0.1, 0.22],
      win: [660, 0.28, 0.22],
      lose: [120, 0.35, 0.2],
    };
    const [frequency, duration, gainValue] = profiles[name];
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = name === 'battle' || name === 'hit' ? 'sawtooth' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.55), ctx.currentTime + duration);
    gain.gain.setValueAtTime(gainValue * this.settings.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  private startMusic(): void {
    if (this.musicOscillator || this.settings.musicVolume <= 0) {
      return;
    }
    const ctx = this.ensureContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 132;
    gain.gain.value = this.settings.musicVolume * 0.08;
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    this.musicOscillator = oscillator;
    this.musicGain = gain;
  }
}
