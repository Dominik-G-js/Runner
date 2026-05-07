import * as THREE from 'three';
import { CrowdCharacter } from './CrowdCharacter';
import { clamp } from '../utils/MathUtils';
import { createTextSprite, updateTextSprite } from '../utils/TextSprite';

const RED = 0xff3355;

export class EnemyCrowd {
  readonly group = new THREE.Group();
  readonly badge: THREE.Sprite;
  defeated = false;
  engaged = false;
  count: number;
  private readonly characters: CrowdCharacter[] = [];

  constructor(x: number, z: number, count: number) {
    this.count = count;
    this.group.position.set(x, 0, z);
    this.badge = createTextSprite(String(this.count), { background: '#ff3355', width: 2.8, height: 1.35, fontSize: 58 });
    this.badge.position.set(0, 2.7, 0);
    this.group.add(this.badge);
    const visualCount = Math.min(count, 80);
    for (let i = 0; i < visualCount; i += 1) {
      const character = new CrowdCharacter(RED);
      this.characters.push(character);
      this.group.add(character.group);
    }
    this.layout();
  }

  get radius(): number {
    return clamp(0.9 + Math.sqrt(this.count) * 0.12, 1.2, 3.8);
  }

  setCount(value: number): void {
    this.count = Math.max(0, Math.floor(value));
    updateTextSprite(this.badge, String(this.count), '#ff3355');
    const visible = Math.min(this.characters.length, Math.max(0, this.count));
    this.characters.forEach((character, index) => {
      character.group.visible = index < visible;
    });
  }

  update(dt: number, time: number): void {
    const jitter = this.engaged ? 0.08 : 0;
    this.characters.forEach((character, index) => {
      if (this.engaged) {
        character.setTarget(character.group.position.x + Math.sin(time * 18 + index) * jitter, character.group.position.z);
      }
      character.update(dt, time + index * 0.02, this.engaged);
    });
    this.badge.position.y = 2.7 + Math.sin(time * 5) * 0.05;
  }

  private layout(): void {
    const spacing = 0.52;
    const cols = Math.max(2, Math.ceil(Math.sqrt(this.characters.length)));
    this.characters.forEach((character, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      character.warp((col - (cols - 1) * 0.5) * spacing, (row - Math.floor(this.characters.length / cols) * 0.5) * spacing);
    });
  }
}
