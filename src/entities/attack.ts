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

  drawHint(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillStyle = "rgba(255, 0, 0, 0.2)";

    this.shape.drawShape(ctx);
    ctx.fill();
    ctx.stroke();

    const getHint = (n1: number, n2: number) =>
      this.shape.vertices[n1]
        .clone()
        .subtract(this.shape.vertices[n2])
        .scale((1 - this.t / this.hintDuration) * 0.5)
        .add(this.shape.vertices[n2]);

    const hint = [getHint(1, 2), getHint(2, 1), getHint(3, 0), getHint(0, 3)];

    ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    ctx.beginPath();
    ctx.moveTo(hint[0].x, hint[0].y);
    for (let i = 1; i < hint.length; i++) {
      ctx.lineTo(hint[i].x, hint[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawHint(ctx);
  }
}
