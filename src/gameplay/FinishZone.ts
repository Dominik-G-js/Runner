import * as THREE from 'three';

export class FinishZone {
  readonly group = new THREE.Group();

  constructor(readonly z: number, trackWidth: number) {
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.36, metalness: 0.3 });
    const glowMaterial = new THREE.MeshStandardMaterial({ color: 0x79ff4f, emissive: 0x13b800, emissiveIntensity: 0.65, roughness: 0.25 });
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(trackWidth, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0x79ff4f, emissive: 0x13b800, emissiveIntensity: 0.25, roughness: 0.35 }),
    );
    platform.position.set(0, 0.08, z);
    platform.receiveShadow = true;
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(trackWidth, 0.35, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xffd54a, emissive: 0xff7a00, emissiveIntensity: 0.18, roughness: 0.3 }),
    );
    banner.position.set(0, 4, z + 2);
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.34, 4.4, 0.34), metalMaterial);
    const rightPost = leftPost.clone();
    leftPost.position.set(-trackWidth / 2 + 0.32, 2.2, z + 2);
    rightPost.position.set(trackWidth / 2 - 0.32, 2.2, z + 2);
    const topGlow = new THREE.Mesh(new THREE.BoxGeometry(trackWidth - 0.9, 0.12, 0.16), glowMaterial);
    topGlow.position.set(0, 3.72, z + 1.78);
    const floorGlow = new THREE.Mesh(new THREE.BoxGeometry(trackWidth - 1.2, 0.06, 5.8), glowMaterial);
    floorGlow.position.set(0, 0.24, z);
    for (let i = 0; i < 7; i += 1) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.2), metalMaterial);
      tooth.position.set((i - 3) * 1.05, 3.38, z + 1.75);
      this.group.add(tooth);
    }
    this.group.add(platform, banner, leftPost, rightPost, topGlow, floorGlow);
  }
}
