import type { Polygon } from "./polygon";

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

  draw(_ctx: CanvasRenderingContext2D) {}
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

  drawHint(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillStyle = "rgba(255, 0, 0, 0.2)";

    this.shape.drawShape(ctx);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    this.shape.drawShape(ctx, (this.shape.scale * this.t) / this.hintDuration);
    ctx.fill();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawHint(ctx);
  }
}
