import { Vector2 } from "../util/vector2";

export type AABB = {
  min: Vector2;
  max: Vector2;
};

export class Polygon {
  vertices: Vector2[];
  aabb: AABB;

  constructor(position: Vector2, points: Vector2[]) {
    this.vertices = points.map((point) => point.clone().add(position));
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

  debugDraw(ctx: CanvasRenderingContext2D) {
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.moveTo(cx + this.vertices[0].x, cy + this.vertices[0].y);
    for (const point of this.vertices) {
      ctx.lineTo(cx + point.x, cy + point.y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}
