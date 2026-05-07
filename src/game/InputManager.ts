import { clamp } from '../utils/MathUtils';

export class InputManager {
  private readonly keys = new Set<string>();
  private pointerActive = false;
  private lastPointerX = 0;
  private dragDelta = 0;
  private pauseHandler: (() => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  setPauseHandler(handler: () => void): void {
    this.pauseHandler = handler;
  }

  getHorizontalAxis(): number {
    const left = this.keys.has('arrowleft') || this.keys.has('a') ? -1 : 0;
    const right = this.keys.has('arrowright') || this.keys.has('d') ? 1 : 0;
    return clamp(left + right, -1, 1);
  }

  consumeDragDelta(): number {
    const delta = this.dragDelta;
    this.dragDelta = 0;
    return delta;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    this.keys.add(key);
    if (key === 'escape' || key === 'p') {
      this.pauseHandler?.();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.key.toLowerCase());
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.pointerActive = true;
    this.lastPointerX = event.clientX;
    this.canvas.setPointerCapture(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.pointerActive) {
      return;
    }
    const width = Math.max(1, window.innerWidth);
    this.dragDelta += ((event.clientX - this.lastPointerX) / width) * 18;
    this.lastPointerX = event.clientX;
  };

  private readonly onPointerUp = (): void => {
    this.pointerActive = false;
  };
}
