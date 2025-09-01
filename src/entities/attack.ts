import type { Polygon } from "./polygon";
import { screen } from "@/util/draw";

export class Attack {
  shape: Polygon;
  hintDuration: number;
  t = 0;
  over = false;

  constructor(shape: Polygon, hintDuration: number) {
    this.shape = shape;
    this.hintDuration = hintDuration;
  }

  update(dt: number) {
    this.t += dt;
  }

  draw() {}
}

export class StoneAttack extends Attack {
  constructor(shape: Polygon, hintDuration: number) {
    super(shape, hintDuration);
  }

  update(dt: number) {
    super.update(dt);
    if (this.t > this.hintDuration) {
      this.over = true;
    }
  }

  drawHint() {
    screen.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    screen.ctx.fillStyle = "rgba(255, 0, 0, 0.2)";

    this.shape.drawShape();
    screen.ctx.fill();
    screen.ctx.stroke();

    screen.ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    this.shape.drawShape((this.shape.scale * this.t) / this.hintDuration);
    screen.ctx.fill();
  }

  draw() {
    this.drawHint();
  }
}

export class SpearAttack extends Attack {
  constructor(shape: Polygon, hintDuration: number) {
    super(shape, hintDuration);
  }

  update(dt: number) {
    super.update(dt);
    if (this.t > this.hintDuration) {
      this.over = true;
    }
  }

  drawHint() {
    screen.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    screen.ctx.fillStyle = "rgba(255, 0, 0, 0.2)";

    this.shape.drawShape();
    screen.ctx.fill();
    screen.ctx.stroke();

    const getHint = (n1: number, n2: number) =>
      this.shape.vertices[n1]
        .clone()
        .subtract(this.shape.vertices[n2])
        .scale((1 - this.t / this.hintDuration) * 0.5)
        .add(this.shape.vertices[n2]);

    const hint = [getHint(1, 2), getHint(2, 1), getHint(3, 0), getHint(0, 3)];

    screen.ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    screen.ctx.beginPath();
    screen.moveTo(hint[0].x, hint[0].y);
    for (let i = 1; i < hint.length; i++) {
      screen.lineTo(hint[i].x, hint[i].y);
    }
    screen.ctx.closePath();
    screen.ctx.fill();
  }

  draw() {
    this.drawHint();
  }
}
