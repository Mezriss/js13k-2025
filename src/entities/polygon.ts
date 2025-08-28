import { Vector2 } from "../util/vector2";

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

  drawShape(
    ctx: CanvasRenderingContext2D,
    scale = this.scale,
    rotation = this.rotation,
  ) {
    const vertices = this.points.map((point) =>
      point
        .clone()
        .scale(scale)
        .add(this.position)
        .rotateAround(this.position, rotation),
    );
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (const point of vertices) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (const point of this.vertices) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}
