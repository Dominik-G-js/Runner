import * as THREE from 'three';
import { damp } from '../utils/MathUtils';

const headGeometry = new THREE.SphereGeometry(0.18, 12, 9);
const helmetGeometry = new THREE.SphereGeometry(0.205, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.58);
const bodyGeometry = new THREE.CylinderGeometry(0.18, 0.24, 0.52, 10);
const chestGeometry = new THREE.BoxGeometry(0.36, 0.2, 0.08);
const shoulderGeometry = new THREE.BoxGeometry(0.16, 0.1, 0.14);
const bootGeometry = new THREE.BoxGeometry(0.14, 0.08, 0.22);
const limbGeometry = new THREE.CapsuleGeometry(0.055, 0.32, 3, 6);

export class CrowdCharacter {
  readonly group = new THREE.Group();
  private readonly leftArm: THREE.Mesh;
  private readonly rightArm: THREE.Mesh;
  private readonly leftLeg: THREE.Mesh;
  private readonly rightLeg: THREE.Mesh;
  private readonly leftBoot: THREE.Mesh;
  private readonly rightBoot: THREE.Mesh;
  private readonly target = new THREE.Vector3();

  constructor(color: number) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.05, emissive: color, emissiveIntensity: 0.06 });
    const armorMaterial = new THREE.MeshStandardMaterial({ color: 0xd7efff, roughness: 0.34, metalness: 0.12 });
    const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0xf1fbff, roughness: 0.28, metalness: 0.08 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.62, metalness: 0.12 });
    const visorMaterial = new THREE.MeshStandardMaterial({ color: 0x101725, roughness: 0.35 });
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.y = 0.55;
    body.castShadow = true;
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 1.0;
    head.castShadow = true;
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 1.05;
    helmet.rotation.x = Math.PI;
    helmet.castShadow = true;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.055, 0.035), visorMaterial);
    visor.position.set(0, 1.04, -0.175);
    const chest = new THREE.Mesh(chestGeometry, armorMaterial);
    chest.position.set(0, 0.62, -0.18);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, armorMaterial);
    const rightShoulder = leftShoulder.clone();
    leftShoulder.position.set(-0.28, 0.76, -0.01);
    rightShoulder.position.set(0.28, 0.76, -0.01);
    this.leftArm = new THREE.Mesh(limbGeometry, material);
    this.rightArm = new THREE.Mesh(limbGeometry, material);
    this.leftLeg = new THREE.Mesh(limbGeometry, darkMaterial);
    this.rightLeg = new THREE.Mesh(limbGeometry, darkMaterial);
    this.leftBoot = new THREE.Mesh(bootGeometry, darkMaterial);
    this.rightBoot = new THREE.Mesh(bootGeometry, darkMaterial);
    this.leftArm.position.set(-0.27, 0.58, 0);
    this.rightArm.position.set(0.27, 0.58, 0);
    this.leftLeg.position.set(-0.11, 0.2, 0);
    this.rightLeg.position.set(0.11, 0.2, 0);
    this.leftBoot.position.set(-0.11, 0.03, -0.04);
    this.rightBoot.position.set(0.11, 0.03, -0.04);
    this.group.add(body, chest, leftShoulder, rightShoulder, head, helmet, visor, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg, this.leftBoot, this.rightBoot);
  }

  setTarget(x: number, z: number): void {
    this.target.set(x, 0, z);
  }

  warp(x: number, z: number): void {
    this.group.position.set(x, 0, z);
    this.setTarget(x, z);
  }

  update(dt: number, time: number, running: boolean): void {
    this.group.position.x = damp(this.group.position.x, this.target.x, 12, dt);
    this.group.position.z = damp(this.group.position.z, this.target.z, 12, dt);
    const stride = running ? Math.sin(time * 12 + this.group.id) : 0;
    this.group.position.y = running ? Math.abs(stride) * 0.035 : 0;
    this.leftArm.rotation.x = stride * 0.65;
    this.rightArm.rotation.x = -stride * 0.65;
    this.leftLeg.rotation.x = -stride * 0.75;
    this.rightLeg.rotation.x = stride * 0.75;
    this.leftBoot.rotation.x = -stride * 0.75;
    this.rightBoot.rotation.x = stride * 0.75;
  }
}
