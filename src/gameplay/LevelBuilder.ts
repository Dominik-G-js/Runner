import * as THREE from 'three';
import { LevelData } from '../data/levels';
import { Collectible } from './Collectible';
import { EnemyCrowd } from './EnemyCrowd';
import { FinishZone } from './FinishZone';
import { Gate } from './Gate';
import { Obstacle } from './Obstacle';

export interface BuiltLevel {
  gates: Gate[];
  enemies: EnemyCrowd[];
  obstacles: Obstacle[];
  collectibles: Collectible[];
  finish: FinishZone;
}

export class LevelBuilder {
  static readonly trackWidth = 10;

  constructor(private readonly world: THREE.Group) {}

  build(level: LevelData): BuiltLevel {
    this.createEnvironment(level);
    const gates = level.gatePairs.map((data) => {
      const gate = new Gate(data);
      this.world.add(gate.group);
      return gate;
    });
    const enemies = level.enemies.map((data) => {
      const enemy = new EnemyCrowd(data.x, data.z, data.count);
      this.world.add(enemy.group);
      return enemy;
    });
    const obstacles = level.obstacles.map((data) => {
      const obstacle = new Obstacle(data);
      this.world.add(obstacle.group);
      return obstacle;
    });
    const collectibles: Collectible[] = [];
    level.collectibles.forEach((line) => {
      const steps = Math.max(1, line.count - 1);
      for (let i = 0; i < line.count; i += 1) {
        const t = steps === 0 ? 0 : i / steps;
        const x = line.xStart + (line.xEnd - line.xStart) * t;
        const z = line.z + Math.sin(t * Math.PI) * 3;
        const collectible = new Collectible(x, z);
        collectibles.push(collectible);
        this.world.add(collectible.group);
      }
    });
    const finish = new FinishZone(level.length, LevelBuilder.trackWidth);
    this.world.add(finish.group);
    return { gates, enemies, obstacles, collectibles, finish };
  }

  private createEnvironment(level: LevelData): void {
    const trackMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.58 });
    const grimeMaterial = new THREE.MeshStandardMaterial({ color: 0xc8d4df, roughness: 0.9 });
    const crackMaterial = new THREE.MeshStandardMaterial({ color: 0x313945, roughness: 0.95 });
    const slimeMaterial = new THREE.MeshStandardMaterial({ color: 0x79ff4f, emissive: 0x1aff00, emissiveIntensity: 0.25, roughness: 0.35 });

    const track = new THREE.Mesh(
      new THREE.BoxGeometry(LevelBuilder.trackWidth, 0.35, level.length + 34),
      trackMaterial,
    );
    track.position.set(0, -0.18, level.length / 2 - 8);
    track.receiveShadow = true;
    this.world.add(track);

    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x202a38, roughness: 0.45, metalness: 0.25 });
    const glowMaterial = new THREE.MeshStandardMaterial({ color: 0x79ff4f, emissive: 0x5aff20, emissiveIntensity: 0.8, roughness: 0.2 });
    const leftEdge = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, level.length + 34), edgeMaterial);
    const rightEdge = leftEdge.clone();
    leftEdge.position.set(-LevelBuilder.trackWidth / 2 - 0.14, 0.08, level.length / 2 - 8);
    rightEdge.position.set(LevelBuilder.trackWidth / 2 + 0.14, 0.08, level.length / 2 - 8);
    this.world.add(leftEdge, rightEdge);

    const leftGlow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, level.length + 34), glowMaterial);
    const rightGlow = leftGlow.clone();
    leftGlow.position.set(-LevelBuilder.trackWidth / 2 - 0.31, 0.42, level.length / 2 - 8);
    rightGlow.position.set(LevelBuilder.trackWidth / 2 + 0.31, 0.42, level.length / 2 - 8);
    this.world.add(leftGlow, rightGlow);

    const start = new THREE.Mesh(new THREE.BoxGeometry(LevelBuilder.trackWidth, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: 0x244bff, emissive: 0x0923ff, emissiveIntensity: 0.18 }));
    start.position.set(0, 0.04, -5);
    this.world.add(start);

    for (let z = 12; z < level.length; z += 18) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(LevelBuilder.trackWidth - 0.5, 0.04, 0.16), grimeMaterial);
      stripe.position.set(0, 0.035, z);
      this.world.add(stripe);
    }

    for (let z = 18; z < level.length - 10; z += 36) {
      const arrow = this.createLaneArrow(0, z + 4);
      this.world.add(arrow);
    }

    for (let z = 10; z < level.length; z += 14) {
      const seed = Math.sin(z * 12.9898 + level.id * 78.233);
      const crack = new THREE.Mesh(new THREE.BoxGeometry(1.2 + Math.abs(seed) * 1.6, 0.045, 0.08), crackMaterial);
      crack.position.set(seed * 2.6, 0.05, z + Math.cos(z) * 2.2);
      crack.rotation.y = seed * 0.7;
      this.world.add(crack);

      if (z % 28 === 10) {
        const slime = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 0.035, 14), slimeMaterial);
        slime.position.set(-3.8 + Math.abs(seed) * 7.6, 0.065, z + 4);
        slime.scale.set(1.4, 1, 0.55);
        this.world.add(slime);
      }
    }

    for (let z = 8; z < level.length + 16; z += 22) {
      const leftPost = this.createHazardPost(-LevelBuilder.trackWidth / 2 - 1.15, z);
      const rightPost = this.createHazardPost(LevelBuilder.trackWidth / 2 + 1.15, z + 8);
      this.world.add(leftPost, rightPost);
    }

    for (let z = 24; z < level.length; z += 48) {
      const seed = Math.sin(z * 0.93 + level.id);
      this.world.add(this.createToxicTank(seed < 0 ? -7.2 : 7.2, z + 5, seed));
      this.world.add(this.createBillboard(seed < 0 ? 7.6 : -7.6, z + 21, level.id));
    }

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, level.length + 220), new THREE.MeshStandardMaterial({ color: 0x263844, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -3.2, level.length / 2);
    ground.receiveShadow = true;
    this.world.add(ground);
  }

  private createHazardPost(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x161d28, roughness: 0.5, metalness: 0.35 }),
    );
    pole.position.y = 0.9;
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x79ff4f, emissive: 0x5aff20, emissiveIntensity: 0.85 }),
    );
    cap.position.y = 1.9;
    group.add(pole, cap);
    return group;
  }

  private createLaneArrow(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0.085, z);
    const material = new THREE.MeshStandardMaterial({ color: 0x00d8ff, emissive: 0x006dff, emissiveIntensity: 0.2, roughness: 0.35 });
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.035, 1.25), material);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.9, 3), material);
    head.rotation.x = Math.PI / 2;
    head.rotation.z = Math.PI / 3;
    head.position.z = 0.92;
    group.add(shaft, head);
    return group;
  }

  private createToxicTank(x: number, z: number, seed: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, -0.2, z);
    group.rotation.y = seed * 0.25;
    const metal = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.42, metalness: 0.35 });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x79ff4f,
      emissive: 0x22ff00,
      emissiveIntensity: 0.28,
      roughness: 0.18,
      transparent: true,
      opacity: 0.72,
    });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.85, 14), glass);
    tank.position.y = 1.05;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 14), metal);
    const bottom = top.clone();
    top.position.y = 2.02;
    bottom.position.y = 0.08;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), metal);
    pipe.position.set(0.75 * Math.sign(x), 0.72, 0);
    pipe.rotation.z = Math.PI / 2;
    group.add(tank, top, bottom, pipe);
    return group;
  }

  private createBillboard(x: number, z: number, levelId: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = x > 0 ? -0.35 : 0.35;
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x172231, roughness: 0.34, metalness: 0.16, emissive: 0x001321, emissiveIntensity: 0.24 }),
    );
    panel.position.y = 2.45;
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.16, 0.14),
      new THREE.MeshStandardMaterial({ color: levelId % 2 === 0 ? 0xff365e : 0x00d8ff, emissive: levelId % 2 === 0 ? 0x7d001a : 0x006dff, emissiveIntensity: 0.42 }),
    );
    stripe.position.set(0, 2.48, -0.08);
    const postLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x111923, metalness: 0.25, roughness: 0.44 }));
    const postRight = postLeft.clone();
    postLeft.position.set(-0.78, 1.12, 0);
    postRight.position.set(0.78, 1.12, 0);
    group.add(panel, stripe, postLeft, postRight);
    return group;
  }
}
