import { defaultSaveData, defaultSettings, GameSettings, SaveData } from '../data/settings';

const SAVE_KEY = 'crowd-clash-math-save-v1';

export class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  get snapshot(): SaveData {
    return structuredClone(this.data);
  }

  get settings(): GameSettings {
    return { ...this.data.settings };
  }

  updateSettings(settings: GameSettings): void {
    this.data.settings = { ...settings };
    this.persist();
  }

  addCoins(coins: number): void {
    this.data.coins += coins;
    this.persist();
  }

  completeLevel(levelId: number, score: number, coins: number): void {
    const key = String(levelId);
    this.data.bestScores[key] = Math.max(this.data.bestScores[key] ?? 0, score);
    this.data.unlockedLevel = Math.max(this.data.unlockedLevel, levelId + 1);
    this.data.coins += coins;
    this.persist();
  }

  reset(): void {
    this.data = structuredClone(defaultSaveData);
    this.persist();
  }

  private load(): SaveData {
    const fallback = structuredClone(defaultSaveData);
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        unlockedLevel: Math.max(1, Number(parsed.unlockedLevel ?? 1)),
        coins: Math.max(0, Number(parsed.coins ?? 0)),
        bestScores: parsed.bestScores ?? {},
        settings: {
          ...defaultSettings,
          ...(parsed.settings ?? {}),
        },
      };
    } catch {
      return fallback;
    }
  }

  private persist(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
  }
}
