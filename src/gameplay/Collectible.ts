import * as THREE from 'three';
import { CrowdCharacter } from './CrowdCharacter';

export class Collectible {
  readonly group = new THREE.Group();
  collected = false;
  private readonly character = new CrowdCharacter(0x35d6ff);

  constructor(x: number, z: number) {
    this.group.position.set(x, 0, z);
    this.group.add(this.character.group);
  }

  update(dt: number, time: number): void {
    this.group.rotation.y += dt * 1.8;
    this.group.position.y = Math.sin(time * 4 + this.group.id) * 0.08;
    this.character.update(dt, time, true);
  }

  check(playerX: number, playerZ: number, radius: number): boolean {
    if (this.collected) {
      return false;
    }
    const dx = playerX - this.group.position.x;
    const dz = playerZ - this.group.position.z;
    if (Math.hypot(dx, dz) < radius + 0.35) {
      this.collected = true;
      this.group.visible = false;
      return true;
    }
    return false;
  }
}
