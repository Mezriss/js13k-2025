import { Vector2 } from "@/util/vector2";
import { Polygon } from "./polygon";
import { screen } from "@/util/draw";
import stone from "@/assets/stone";
import { getBounds } from "@/util/util";

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

export class StoneAttack {
  t = 0;
  over = false;
  hintDuration = 0;
  attackDuration = 0.5;
  position: Vector2;
  rotation: number;
  scale = 1;
  collider: Polygon;
  constructor(
    position: Vector2,
    rotation: number,
    hintDuration: number,
    scale: number,
  ) {
    this.position = position;
    this.rotation = rotation;
    this.hintDuration = hintDuration;
    this.scale = scale;
    this.collider = new Polygon(
      position,
      getBounds(stone.paths[0], new Vector2(scale, scale)),
      rotation,
      scale,
    );
  }

  update(dt: number) {
    this.t += dt;
    if (this.t > this.hintDuration) {
      this.over = true;
    }
  }

  drawHint() {
    if (this.t > this.hintDuration) return;
    screen.ctx.beginPath();
    screen.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    screen.ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
    stone.drawPath(
      0,
      this.position,
      this.rotation,
      new Vector2(this.scale, this.scale),
    );
    screen.ctx.fill();
    screen.ctx.stroke();

    screen.ctx.beginPath();
    screen.ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    stone.drawPath(
      0,
      this.position,
      this.rotation,
      new Vector2(1, 1).scale((this.scale * this.t) / this.hintDuration),
    );
    screen.ctx.fill();
  }

  draw() {
    const attackStart = this.hintDuration - this.attackDuration;
    if (this.t < attackStart) return;
    const at = this.t - attackStart;
    stone.draw(
      this.position.clone().add(
        this.position
          .clone()
          .normalize()
          .scale(screen.scale * 5 * (1 - at / this.attackDuration)),
      ),
      new Vector2(this.scale, this.scale),
      this.rotation + Math.PI * (1 - at / this.attackDuration),
    );
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
