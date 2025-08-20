import type { Vector2 } from "./vector2";

// Catmull–Rom spline
export function drawSpline(
  ctx: CanvasRenderingContext2D,
  points: Vector2[],
): void {
  if (points.length < 2) {
    return;
  }

  points.unshift(points[0]);
  points.push(points[points.length - 1]);

  // The first point in a curveVertex sequence is a control point, so we just move to the second point.
  ctx.moveTo(points[1].x, points[1].y);

  // Iterate through the points to create curve segments.
  // A segment from points[i] to points[i+1] needs points[i-1] and points[i+2] as controls.
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]; // Use the first point as p0 for the first segment
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2]; // Use the last point as p3 for the last segment

    // Calculate the two Bézier control points for this segment
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    // Draw the cubic Bézier curve segment
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  pos: Vector2,
  r: number,
) {
  ctx.ellipse(pos.x, pos.y, r, r, 0, 0, Math.PI * 2);
}

export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  pos: Vector2,
  rx: number,
  ry: number,
  rotation: number,
) {
  ctx.ellipse(pos.x, pos.y, rx, ry, rotation, 0, Math.PI * 2);
}
