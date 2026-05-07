import * as THREE from 'three';
import { GameSettings } from '../data/settings';
import { damp } from '../utils/MathUtils';

export class CameraController {
  private readonly baseOffset = new THREE.Vector3(0, 12, -18);
  private readonly target = new THREE.Vector3();
  private shakeTime = 0;
  private shakeStrength = 0;

  constructor(private readonly camera: THREE.PerspectiveCamera, private settings: GameSettings) {}

  updateSettings(settings: GameSettings): void {
    this.settings = settings;
  }

  shake(strength: number, duration: number): void {
    if (!this.settings.cameraShake) {
      return;
    }
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  update(dt: number, playerPosition: THREE.Vector3): void {
    const desired = new THREE.Vector3(
      playerPosition.x * 0.45,
      playerPosition.y + this.baseOffset.y,
      playerPosition.z + this.baseOffset.z,
    );
    this.camera.position.x = damp(this.camera.position.x, desired.x, 4.8, dt);
    this.camera.position.y = damp(this.camera.position.y, desired.y, 4.8, dt);
    this.camera.position.z = damp(this.camera.position.z, desired.z, 4.8, dt);

    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const intensity = this.shakeStrength * Math.max(0, this.shakeTime);
      this.camera.position.x += (Math.random() - 0.5) * intensity;
      this.camera.position.y += (Math.random() - 0.5) * intensity;
    }

    this.target.set(playerPosition.x * 0.25, 1.4, playerPosition.z + 12);
    this.camera.lookAt(this.target);
  }
}
