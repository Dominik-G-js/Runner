export type EaseFn = (t: number) => number;

export const easeOutBack: EaseFn = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export class Tween {
  public elapsed = 0;
  public done = false;

  constructor(
    private readonly duration: number,
    private readonly onUpdate: (t: number) => void,
    private readonly easing: EaseFn = (t) => t,
    private readonly onDone?: () => void,
  ) {}

  update(dt: number): void {
    if (this.done) {
      return;
    }
    this.elapsed += dt;
    const t = Math.min(1, this.elapsed / this.duration);
    this.onUpdate(this.easing(t));
    if (t >= 1) {
      this.done = true;
      this.onDone?.();
    }
  }
}
