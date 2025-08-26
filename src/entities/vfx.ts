import { cmax, drawCircle } from "../util/draw";
import { easing } from "../util/util";
import type { Vector2 } from "../util/vector2";

export type Vfx = {
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  progress: number;
};

const rippleDuration = 2;
export class Ripple {
  position: Vector2;
  progress = 0;

  constructor(position: Vector2) {
    this.position = position;
  }
  update(dt: number) {
    this.progress += dt / rippleDuration;
  }
  draw(ctx: CanvasRenderingContext2D) {
    // oklab(0.54 0.04 -0.13 / 1)

    ctx.beginPath();
    drawCircle(
      ctx,
      this.position,
      easing.easeOutCubic(this.progress) * cmax(15),
    );
    ctx.lineWidth = cmax(9 * easing.easeOutCubic(this.progress));
    ctx.strokeStyle = `oklab(${0.64 - 0.1 * (1 - easing.easeOutCubic(this.progress))} 0.04 -0.13 / 1)`;
    ctx.stroke();
  }
}
