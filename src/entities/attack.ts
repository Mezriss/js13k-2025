import { Vector2 } from "@/util/vector2";
import { Polygon } from "./polygon";
import { screen } from "@/util/draw";
import stone from "@/assets/stone";
import { getBounds } from "@/util/util";
import spear from "@/assets/spear";

export class StoneAttack {
  t = 0;
  over = false;
  hintDuration = 0;
  attackDuration = 0.5;
  position: Vector2;
  rotation: number;
  scale: number;
  collider: Polygon;
  constructor(
    position: Vector2,
    rotation: number,
    hintDuration: number,
    scale = 1,
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

const spearAttackShape = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
].map((p) =>
  new Vector2(...(p as [number, number])).multiply(new Vector2(50, 2)),
);

export class SpearAttack {
  t = 0;
  over = false;
  hintDuration = 0;
  attackDuration = 0.4;
  position: Vector2;
  rotation: number;
  scale: number;
  collider: Polygon;

  constructor(
    position: Vector2,
    rotation: number,
    hintDuration: number,
    scale = 1,
  ) {
    this.position = position;
    this.rotation = rotation;
    this.collider = new Polygon(position, spearAttackShape, rotation, scale);
    this.hintDuration = hintDuration;
    this.scale = scale;
  }

  update(dt: number) {
    this.t += dt;
    if (this.t > this.hintDuration) {
      this.over = true;
    }
  }

  drawHint() {
    screen.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    screen.ctx.fillStyle = "rgba(255, 0, 0, 0.2)";

    this.collider.drawShape();
    screen.ctx.fill();
    screen.ctx.stroke();

    const getHint = (n1: number, n2: number) =>
      this.collider.vertices[n1]
        .clone()
        .subtract(this.collider.vertices[n2])
        .scale((1 - this.t / this.hintDuration) * 0.5)
        .add(this.collider.vertices[n2]);

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
    const attackStart = this.hintDuration - this.attackDuration;
    if (this.t < attackStart) return;
    const at = this.t - attackStart;
    spear.draw(
      this.position
        .clone()
        .add(
          Vector2.fromAngle(this.rotation).scale(
            -screen.scale * 10 * (0.5 - at / this.attackDuration),
          ),
        ),
      new Vector2(this.scale, this.scale),
      this.rotation + Math.PI / 2,
    );
  }
}
