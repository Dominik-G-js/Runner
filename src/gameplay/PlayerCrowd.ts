import * as THREE from 'three';
import { CrowdCharacter } from './CrowdCharacter';
import { GateOperation } from '../data/levels';
import { clamp } from '../utils/MathUtils';
import { createTextSprite, updateTextSprite } from '../utils/TextSprite';

const BLUE = 0x1687ff;

export class PlayerCrowd {
  readonly group = new THREE.Group();
  readonly badge: THREE.Sprite;
  count: number;
  targetX = 0;
  speed = 13.5;
  private readonly characters: CrowdCharacter[] = [];
  private readonly visualLimit: number;

  constructor(startCount: number, quality: 'low' | 'medium' | 'high') {
    this.count = startCount;
    this.visualLimit = quality === 'low' ? 55 : quality === 'medium' ? 85 : 120;
    this.badge = createTextSprite(String(this.count), { background: '#1687ff', width: 2.8, height: 1.35, fontSize: 58 });
    this.badge.position.set(0, 2.7, 0);
    this.group.add(this.badge);
    this.syncVisuals(true);
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get radius(): number {
    return clamp(0.8 + Math.sqrt(this.count) * 0.13, 1, 3.6);
  }

  setCount(value: number): void {
    this.count = Math.max(0, Math.floor(value));
    updateTextSprite(this.badge, String(this.count), '#1687ff');
    this.syncVisuals(false);
  }

  add(amount: number): void {
    this.setCount(this.count + amount);
  }

  applyOperation(operation: GateOperation): number {
    const before = this.count;
    if (operation.operator === '+') this.setCount(this.count + operation.value);
    if (operation.operator === 'x') this.setCount(this.count * operation.value);
    if (operation.operator === '-') this.setCount(Math.max(1, this.count - operation.value));
    if (operation.operator === '/') this.setCount(Math.max(1, Math.floor(this.count / operation.value)));
    return this.count - before;
  }

  update(dt: number, time: number, trackHalfWidth: number): void {
    this.targetX = clamp(this.targetX, -trackHalfWidth + this.radius, trackHalfWidth - this.radius);
    this.group.position.x += (this.targetX - this.group.position.x) * (1 - Math.exp(-12 * dt));
    this.group.position.z += this.speed * dt;
    this.layoutCharacters();
    this.characters.forEach((character) => character.update(dt, time, true));
    this.badge.position.set(0, 2.8 + Math.sin(time * 5) * 0.08, 0);
  }

  private syncVisuals(warp: boolean): void {
    const desired = Math.min(this.count, this.visualLimit);
    while (this.characters.length < desired) {
      const character = new CrowdCharacter(BLUE);
      this.characters.push(character);
      this.group.add(character.group);
      if (warp) character.warp(0, 0);
    }
    while (this.characters.length > desired) {
      const character = this.characters.pop();
      if (character) {
        this.group.remove(character.group);
      }
    }
    this.layoutCharacters();
  }

  private layoutCharacters(): void {
    const spacing = 0.52;
    const cols = Math.max(2, Math.ceil(Math.sqrt(this.characters.length)));
    this.characters.forEach((character, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = (col - (cols - 1) * 0.5) * spacing;
      const z = (row - Math.floor(this.characters.length / cols) * 0.5) * spacing * 0.9;
      character.setTarget(x, z);
    });
  }
}
