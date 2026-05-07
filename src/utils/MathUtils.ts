export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function formatOperation(operator: string, value: number): string {
  return `${operator}${value}`;
}
