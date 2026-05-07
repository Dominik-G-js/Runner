import * as THREE from 'three';
import { randomRange } from '../utils/MathUtils';
import { createTextSprite } from '../utils/TextSprite';

interface FloatingText {
  sprite: THREE.Sprite;
  age: number;
  duration: number;
  velocity: THREE.Vector3;
}

interface Particle {
  mesh: THREE.Mesh;
  age: number;
  duration: number;
  velocity: THREE.Vector3;
}

interface Shockwave {
  mesh: THREE.Mesh;
  age: number;
  duration: number;
}

export class Effects {
  private readonly texts: FloatingText[] = [];
  private readonly particles: Particle[] = [];
  private readonly shockwaves: Shockwave[] = [];

  constructor(private readonly world: THREE.Group) {}

  floatingText(text: string, position: THREE.Vector3, positive: boolean): void {
    const sprite = createTextSprite(text, {
      background: positive ? '#11c77c' : '#ff4d5d',
      width: 2.2,
      height: 1.05,
      fontSize: 56,
    });
    sprite.position.copy(position).add(new THREE.Vector3(0, 3.2, 0));
    this.texts.push({ sprite, age: 0, duration: 0.85, velocity: new THREE.Vector3(0, 2.4, 0) });
    this.world.add(sprite);
  }

  burst(position: THREE.Vector3, color: number, count = 16): void {
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 });
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), material);
      mesh.position.copy(position).add(new THREE.Vector3(0, 1.2, 0));
      const velocity = new THREE.Vector3(randomRange(-2, 2), randomRange(1, 4), randomRange(-2, 2));
      this.particles.push({ mesh, age: 0, duration: randomRange(0.35, 0.7), velocity });
      this.world.add(mesh);
    }
  }

  shockwave(position: THREE.Vector3, color: number): void {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 6, 48), material);
    mesh.position.copy(position).add(new THREE.Vector3(0, 0.12, 0));
    mesh.rotation.x = Math.PI / 2;
    this.shockwaves.push({ mesh, age: 0, duration: 0.55 });
    this.world.add(mesh);
  }

  update(dt: number): void {
    for (let i = this.texts.length - 1; i >= 0; i -= 1) {
      const item = this.texts[i];
      item.age += dt;
      item.sprite.position.addScaledVector(item.velocity, dt);
      const material = item.sprite.material as THREE.SpriteMaterial;
      material.opacity = Math.max(0, 1 - item.age / item.duration);
      if (item.age >= item.duration) {
        this.world.remove(item.sprite);
        material.map?.dispose();
        material.dispose();
        this.texts.splice(i, 1);
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const item = this.particles[i];
      item.age += dt;
      item.velocity.y -= 8 * dt;
      item.mesh.position.addScaledVector(item.velocity, dt);
      item.mesh.scale.setScalar(Math.max(0.05, 1 - item.age / item.duration));
      if (item.age >= item.duration) {
        this.world.remove(item.mesh);
        item.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      }
    }
    for (let i = this.shockwaves.length - 1; i >= 0; i -= 1) {
      const item = this.shockwaves[i];
      item.age += dt;
      const t = Math.min(1, item.age / item.duration);
      item.mesh.scale.setScalar(1 + t * 5.5);
      const material = item.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 0.65 * (1 - t));
      if (item.age >= item.duration) {
        this.world.remove(item.mesh);
        item.mesh.geometry.dispose();
        material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }
  }
}
