export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: GraphicsQuality;
  cameraShake: boolean;
}

export interface SaveData {
  unlockedLevel: number;
  coins: number;
  bestScores: Record<string, number>;
  settings: GameSettings;
}

export const defaultSettings: GameSettings = {
  musicVolume: 0.35,
  sfxVolume: 0.7,
  graphicsQuality: 'high',
  cameraShake: true,
};

export const defaultSaveData: SaveData = {
  unlockedLevel: 1,
  coins: 0,
  bestScores: {},
  settings: defaultSettings,
};
