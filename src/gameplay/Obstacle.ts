import * as THREE from 'three';
import { ObstacleData } from '../data/levels';

export class Obstacle {
  readonly group = new THREE.Group();
  consumed = false;
  private readonly mover = new THREE.Group();
  private readonly coreParts: THREE.Object3D[] = [];

  constructor(readonly data: ObstacleData) {
    this.group.position.set(data.x, 0, data.z);
    this.group.add(this.mover);
    if (data.type === 'rotatingBar') {
      const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0x1b2230, metalness: 0.35, roughness: 0.42 }));
      pivot.position.y = 0.6;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(data.width ?? 4.2, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0xffd43b, emissive: 0xff5a00, emissiveIntensity: 0.25 }));
      bar.position.y = 1.05;
      bar.castShadow = true;
      const endMaterial = new THREE.MeshStandardMaterial({ color: 0xff365e, emissive: 0x7d001a, emissiveIntensity: 0.28, roughness: 0.3 });
      const leftEnd = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), endMaterial);
      const rightEnd = leftEnd.clone();
      leftEnd.position.set(-(data.width ?? 4.2) / 2, 1.05, 0);
      rightEnd.position.set((data.width ?? 4.2) / 2, 1.05, 0);
      const warning = this.createWarningBase(data.width ?? 4.2, 1.25);
      this.mover.add(pivot, bar, leftEnd, rightEnd);
      this.group.add(warning);
    }
    if (data.type === 'spikes') {
      const count = 7;
      const base = this.createWarningBase(data.width ?? 3.8, 1.2);
      this.group.add(base);
      for (let i = 0; i < count; i += 1) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 4), new THREE.MeshStandardMaterial({ color: 0x222936, metalness: 0.4, roughness: 0.32 }));
        spike.position.set((i - (count - 1) / 2) * 0.55, 0.38, 0);
        spike.rotation.y = Math.PI / 4;
        spike.castShadow = true;
        this.mover.add(spike);
      }
    }
    if (data.type === 'movingBlock') {
      const block = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), new THREE.MeshStandardMaterial({ color: 0xff365e, emissive: 0x7d001a, emissiveIntensity: 0.22 }));
      block.position.y = 1;
      block.castShadow = true;
      const leftRail = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x79ff4f, emissive: 0x5aff20, emissiveIntensity: 0.55 }));
      const rightRail = leftRail.clone();
      leftRail.position.set(0, 0.12, -0.95);
      rightRail.position.set(0, 0.12, 0.95);
      this.group.add(leftRail, rightRail);
      this.addArmorPlates(block);
      this.mover.add(block);
    }
    if (data.type === 'crusher') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.25, 2.1), new THREE.MeshStandardMaterial({ color: 0x1b2230, metalness: 0.3, roughness: 0.5 }));
      base.position.y = 0.15;
      const crusher = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 2.2), new THREE.MeshStandardMaterial({ color: 0xff5d32, emissive: 0x7a1600, emissiveIntensity: 0.2 }));
      crusher.position.y = 2.2;
      crusher.castShadow = true;
      const leftGuide = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.18), new THREE.MeshStandardMaterial({ color: 0x111923, metalness: 0.35, roughness: 0.35 }));
      const rightGuide = leftGuide.clone();
      leftGuide.position.set(-1.25, 1.7, 0);
      rightGuide.position.set(1.25, 1.7, 0);
      this.addArmorPlates(crusher);
      this.mover.add(base, crusher, leftGuide, rightGuide);
    }
  }

  update(dt: number, time: number): void {
    if (this.data.type === 'rotatingBar') {
      this.mover.rotation.y += dt * 3.8;
    }
    if (this.data.type === 'movingBlock') {
      this.mover.position.x = Math.sin(time * 2.2 + this.group.position.z) * 3.1;
    }
    if (this.data.type === 'crusher') {
      this.mover.children.forEach((child, index) => {
        if (index === 1) child.position.y = 1.6 + Math.abs(Math.sin(time * 2.8)) * 2.2;
      });
    }
  }

  check(playerX: number, playerZ: number, radius: number): boolean {
    if (this.consumed || Math.abs(playerZ - this.group.position.z) > 1.25 + radius * 0.2) {
      return false;
    }
    const obstacleX = this.group.position.x + this.mover.position.x;
    const halfWidth = this.data.type === 'spikes' ? (this.data.width ?? 3.8) * 0.55 : this.data.type === 'rotatingBar' ? 2.5 : 1.25;
    if (Math.abs(playerX - obstacleX) < halfWidth + radius * 0.45) {
      this.consumed = true;
      this.group.visible = false;
      return true;
    }
    return false;
  }

  private createWarningBase(width: number, depth: number): THREE.Group {
    const group = new THREE.Group();
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x151c28, roughness: 0.52, metalness: 0.18 });
    const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xffd43b, emissive: 0xff5a00, emissiveIntensity: 0.18 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(width + 0.45, 0.08, depth), baseMaterial);
    base.position.y = 0.04;
    group.add(base);
    for (let i = -2; i <= 2; i += 1) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, depth + 0.02), stripeMaterial);
      stripe.position.set(i * 0.48, 0.095, 0);
      stripe.rotation.y = 0.65;
      group.add(stripe);
    }
    return group;
  }

  private addArmorPlates(parent: THREE.Mesh): void {
    const plateMaterial = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.4, metalness: 0.2 });
    for (const [x, y, z] of [
      [-0.52, 0.38, -0.93],
      [0.52, 0.38, -0.93],
      [-0.52, -0.38, -0.93],
      [0.52, -0.38, -0.93],
    ] as const) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.05), plateMaterial);
      plate.position.set(x, y, z);
      parent.add(plate);
    }
  }
}
