import { screen, drawCircle } from "../util/draw";
import { easing } from "../util/util";
import type { Vector2 } from "../util/vector2";

export type Vfx = {
  update: (dt: number) => void;
  draw: () => void;
  progress: number;
};

const rippleDuration = 2;
export class Ripple {
  position: Vector2;
  progress = 0;
  big: boolean;

  constructor(position: Vector2, big = false) {
    this.position = position;
    this.big = big;
  }
  update(dt: number) {
    this.progress += dt / rippleDuration;
  }
  draw() {
    // oklab(0.54 0.04 -0.13 / 1)
    // TODO: Implement strong/weak ripple effect

    screen.ctx.save();
    screen.ctx.beginPath();
    drawCircle(this.position, easing.easeOutCubic(this.progress) * 15);
    screen.ctx.lineWidth =
      9 * screen.scale * easing.easeOutCubic(this.progress);
    screen.ctx.strokeStyle = `oklab(${0.64 - 0.1 * (1 - easing.easeOutCubic(this.progress))} 0.04 -0.13 / 1)`;
    screen.ctx.stroke();
    screen.ctx.restore();
  }
}
