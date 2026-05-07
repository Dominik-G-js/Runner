import * as THREE from 'three';
import { GateOperation, GatePairData } from '../data/levels';
import { formatOperation } from '../utils/MathUtils';
import { createTextSprite } from '../utils/TextSprite';

export interface GateHit {
  operation: GateOperation;
  label: string;
  positive: boolean;
}

export class Gate {
  readonly group = new THREE.Group();
  private triggered = false;
  private readonly panels: THREE.Object3D[] = [];
  private readonly glows: THREE.Mesh[] = [];

  constructor(private readonly data: GatePairData) {
    this.group.position.z = data.z;
    this.group.add(this.createPanel(-2.6, data.left), this.createPanel(2.6, data.right));
    this.group.add(this.createCenterDivider());
  }

  check(playerX: number, playerZ: number): GateHit | null {
    if (this.triggered || Math.abs(playerZ - this.data.z) > 1.1) {
      return null;
    }
    this.triggered = true;
    const operation = playerX < 0 ? this.data.left : this.data.right;
    return {
      operation,
      label: formatOperation(operation.operator, operation.value),
      positive: operation.operator === '+' || operation.operator === 'x',
    };
  }

  update(time: number, playerZ: number): void {
    const distance = Math.abs(playerZ - this.data.z);
    const attention = Math.max(0, 1 - distance / 20);
    const pulse = 1 + Math.sin(time * 4.5 + this.data.z) * 0.025 * (0.4 + attention);
    this.panels.forEach((panel, index) => {
      panel.scale.setScalar(this.triggered ? 0.96 : pulse + index * 0.002);
      panel.position.y = Math.sin(time * 2.2 + index) * 0.04;
    });
    this.glows.forEach((glow, index) => {
      const material = glow.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = this.triggered ? 0.22 : 0.55 + Math.sin(time * 6 + index) * 0.22 + attention * 0.28;
    });
  }

  private createPanel(x: number, operation: GateOperation): THREE.Object3D {
    const positive = operation.operator === '+' || operation.operator === 'x';
    const group = new THREE.Group();
    group.position.x = x;
    group.userData.baseY = 0;
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(3.45, 3.1, 0.22),
      new THREE.MeshStandardMaterial({
        color: positive ? 0x35f1ff : 0xff4b38,
        emissive: positive ? 0x006d8f : 0x7a1200,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.55,
        roughness: 0.25,
      }),
    );
    panel.position.y = 1.7;
    panel.castShadow = true;
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.32, metalness: 0.28 });
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: positive ? 0x60f6ff : 0xff6b35,
      emissive: positive ? 0x00c8ff : 0xff2800,
      emissiveIntensity: 0.7,
      roughness: 0.22,
    });
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.65, 0.22), frameMaterial);
    const rightPost = leftPost.clone();
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(3.78, 0.18, 0.22), frameMaterial);
    const baseRail = topRail.clone();
    const glowRail = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.07, 0.12), glowMaterial);
    this.glows.push(glowRail);
    leftPost.position.set(-1.86, 1.82, -0.02);
    rightPost.position.set(1.86, 1.82, -0.02);
    topRail.position.set(0, 3.47, -0.02);
    baseRail.position.set(0, 0.14, -0.02);
    glowRail.position.set(0, 3.18, -0.16);
    const label = createTextSprite(formatOperation(operation.operator, operation.value), {
      background: positive ? '#00d8ff' : '#ff432d',
      width: 2.5,
      height: 1.2,
      fontSize: 62,
    });
    label.position.set(0, 3.7, 0.05);
    for (const sx of [-1, 1]) {
      const boltTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.08), glowMaterial);
      const boltBottom = boltTop.clone();
      this.glows.push(boltTop, boltBottom);
      boltTop.position.set(sx * 1.5, 3.24, -0.2);
      boltBottom.position.set(sx * 1.5, 0.42, -0.2);
      group.add(boltTop, boltBottom);
    }
    group.add(panel, leftPost, rightPost, topRail, baseRail, glowRail, label);
    this.panels.push(group);
    return group;
  }

  private createCenterDivider(): THREE.Object3D {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.35, metalness: 0.32 });
    const glow = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x79ff4f, emissiveIntensity: 0.45 });
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.4, 0.28), material);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), glow);
    pillar.position.y = 1.7;
    cap.position.y = 3.55;
    group.add(pillar, cap);
    return group;
  }
}
