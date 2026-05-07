import * as THREE from 'three';

export function createTextSprite(
  text: string,
  options: {
    background: string;
    color?: string;
    width?: number;
    height?: number;
    fontSize?: number;
  },
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }
  const bg = options.background;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bg;
  roundRect(ctx, 14, 18, 228, 92, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = options.color ?? '#ffffff';
  ctx.font = `900 ${options.fontSize ?? 54}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 65);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(options.width ?? 3.4, options.height ?? 1.7, 1);
  sprite.renderOrder = 10;
  return sprite;
}

export function updateTextSprite(sprite: THREE.Sprite, text: string, background: string): void {
  const material = sprite.material as THREE.SpriteMaterial;
  material.map?.dispose();
  const replacement = createTextSprite(text, { background, width: sprite.scale.x, height: sprite.scale.y });
  const replacementMaterial = replacement.material as THREE.SpriteMaterial;
  material.map = replacementMaterial.map;
  material.needsUpdate = true;
  replacementMaterial.map = null;
  replacementMaterial.dispose();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
