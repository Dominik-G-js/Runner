export enum GameState {
  Boot = 'Boot',
  MainMenu = 'MainMenu',
  LevelSelect = 'LevelSelect',
  Playing = 'Playing',
  Paused = 'Paused',
  Win = 'Win',
  Lose = 'Lose',
  Settings = 'Settings',
}

export interface LevelResult {
  levelId: number;
  remainingCrowd: number;
  coinsEarned: number;
  stars: number;
  score: number;
}
