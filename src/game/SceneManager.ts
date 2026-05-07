import * as THREE from 'three';
import { GameSettings } from '../data/settings';

export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(58, 1, 0.1, 600);
  readonly renderer: THREE.WebGLRenderer;
  readonly world = new THREE.Group();

  constructor(private readonly canvas: HTMLCanvasElement, settings: GameSettings) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x123142, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = settings.graphicsQuality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(this.pixelRatioFor(settings));

    this.scene.background = new THREE.Color(0x123142);
    this.scene.fog = new THREE.Fog(0x123142, 62, 330);
    this.scene.add(this.world);
    this.setupLights();
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  applySettings(settings: GameSettings): void {
    this.renderer.setPixelRatio(this.pixelRatioFor(settings));
    this.renderer.shadowMap.enabled = settings.graphicsQuality !== 'low';
  }

  clearWorld(): void {
    while (this.world.children.length > 0) {
      const child = this.world.children[0];
      this.world.remove(child);
      this.disposeObject(child);
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    window.removeEventListener('resize', this.resize);
    this.renderer.dispose();
  }

  private readonly resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private setupLights(): void {
    const hemisphere = new THREE.HemisphereLight(0xcffcff, 0x38444f, 1.15);
    this.scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xffffff, 2.35);
    sun.position.set(-8, 18, -10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -20;
    this.scene.add(sun);

    const toxicRim = new THREE.DirectionalLight(0x8dff5a, 1.4);
    toxicRim.position.set(12, 8, 18);
    this.scene.add(toxicRim);
  }

  private pixelRatioFor(settings: GameSettings): number {
    const cap = settings.graphicsQuality === 'high' ? 2 : settings.graphicsQuality === 'medium' ? 1.5 : 1;
    return Math.min(window.devicePixelRatio || 1, cap);
  }

  private disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      const material = mesh.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else if (material) {
        material.dispose();
      }
    });
  }
}
