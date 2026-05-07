import { EnemyCrowd } from './EnemyCrowd';
import { PlayerCrowd } from './PlayerCrowd';

export type BattleOutcome = 'none' | 'win' | 'lose';

export class BattleSystem {
  private activeEnemy: EnemyCrowd | null = null;
  private tickTimer = 0;

  start(enemy: EnemyCrowd): void {
    this.activeEnemy = enemy;
    enemy.engaged = true;
  }

  get active(): boolean {
    return this.activeEnemy !== null;
  }

  update(dt: number, player: PlayerCrowd): BattleOutcome {
    const enemy = this.activeEnemy;
    if (!enemy) {
      return 'none';
    }
    this.tickTimer += dt;
    const tickRate = 0.035;
    while (this.tickTimer >= tickRate && enemy.count > 0 && player.count > 0) {
      this.tickTimer -= tickRate;
      const damage = Math.max(1, Math.ceil(Math.min(player.count, enemy.count) * 0.015));
      player.setCount(player.count - damage);
      enemy.setCount(enemy.count - damage);
    }
    if (player.count <= 0 || player.count <= enemy.count && enemy.count <= 2) {
      player.setCount(0);
      enemy.engaged = false;
      this.activeEnemy = null;
      return 'lose';
    }
    if (enemy.count <= 0) {
      enemy.defeated = true;
      enemy.engaged = false;
      enemy.group.visible = false;
      this.activeEnemy = null;
      return 'win';
    }
    return 'none';
  }
}
