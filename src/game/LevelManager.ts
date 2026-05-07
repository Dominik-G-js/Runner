import { getLevel, levels, LevelData } from '../data/levels';

export class LevelManager {
  readonly totalLevels = levels.length;
  private currentLevelId = 1;

  load(levelId: number): LevelData {
    this.currentLevelId = Math.max(1, Math.min(this.totalLevels, levelId));
    return getLevel(this.currentLevelId);
  }

  get currentId(): number {
    return this.currentLevelId;
  }
}
