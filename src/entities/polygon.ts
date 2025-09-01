import { Vector2 } from "@/util/vector2";
import { screen } from "@/util/draw";

export type AABB = {
  min: Vector2;
  max: Vector2;
};

export class Polygon {
  position: Vector2;
  points: Vector2[];
  rotation: number;
  scale: number;
  vertices: Vector2[];
  aabb: AABB;

  constructor(position: Vector2, shape: Vector2[], rotation = 0, scale = 1) {
    this.position = position;
    this.points = shape;
    this.rotation = rotation;
    this.scale = scale;
    this.vertices = shape.map((point) =>
      point.clone().scale(scale).add(position).rotateAround(position, rotation),
    );
    this.aabb = {
      min: new Vector2(
        Math.min(...this.vertices.map((v) => v.x)),
        Math.min(...this.vertices.map((v) => v.y)),
      ),
      max: new Vector2(
        Math.max(...this.vertices.map((v) => v.x)),
        Math.max(...this.vertices.map((v) => v.y)),
      ),
    };
  }

  drawShape(scale = this.scale, rotation = this.rotation) {
    const vertices = this.points.map((point) =>
      point
        .clone()
        .scale(scale)
        .add(this.position)
        .rotateAround(this.position, rotation),
    );
    screen.ctx.beginPath();
    screen.moveTo(vertices[0].x, vertices[0].y);
    for (const point of vertices) {
      screen.lineTo(point.x, point.y);
    }
    screen.closePath();
  }

  debugDraw() {
    screen.ctx.beginPath();
    screen.ctx.strokeStyle = "red";
    screen.ctx.lineWidth = 2;
    screen.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (const point of this.vertices) {
      screen.lineTo(point.x, point.y);
    }
    screen.ctx.closePath();
    screen.ctx.stroke();
  }
}
