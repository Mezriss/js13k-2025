import type { Vector2 } from "./vector2";

const ASPECT_RATIO = 16 / 9;

export const screen = {
  scale: 1,
  ctx: (document.getElementById("c") as HTMLCanvasElement).getContext("2d")!,
  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x * screen.scale, y * screen.scale);
  },
  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x * screen.scale, y * screen.scale);
  },
  closePath(): void {
    this.ctx.closePath();
  },
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ): void {
    const scaledParams = [cp1x, cp1y, cp2x, cp2y, x, y].map(
      (p) => p * screen.scale,
    ) as [number, number, number, number, number, number];
    this.ctx.bezierCurveTo(...scaledParams);
  },
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean,
  ): void {
    const scaledParams = [x, y, radiusX, radiusY].map(
      (p) => p * screen.scale,
    ) as [number, number, number, number];
    this.ctx.ellipse(
      ...scaledParams,
      rotation,
      startAngle,
      endAngle,
      counterclockwise,
    );
  },
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    const scaledParams = [x, y].map((p) => p * screen.scale) as [
      number,
      number,
    ];
    this.ctx.fillText(text, ...scaledParams, maxWidth);
  },
};

const resizeCanvas = () => {
  const canvas = document.getElementById("c") as HTMLCanvasElement;
  if (!canvas) return;

  const { innerWidth: w, innerHeight: h } = window;

  // Calculate canvas size to fill window while maintaining 16:9 aspect ratio
  let canvasWidth = w;
  let canvasHeight = w / ASPECT_RATIO;

  if (canvasHeight > h) {
    canvasHeight = h;
    canvasWidth = h * ASPECT_RATIO;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  screen.scale = canvasWidth / 160;
};

export const init = () => {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
};

// Catmull–Rom spline
export function drawSpline(points: Vector2[]): void {
  if (points.length < 2) {
    return;
  }

  points.unshift(points[0]);
  points.push(points[points.length - 1]);

  // The first point in a curveVertex sequence is a control point, so we just move to the second point.
  screen.moveTo(points[1].x, points[1].y);

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
    screen.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

export function drawCircle(pos: Vector2, r: number) {
  screen.ellipse(pos.x, pos.y, r, r, 0, 0, Math.PI * 2);
}

export function drawEllipse(
  pos: Vector2,
  rx: number,
  ry: number,
  rotation: number,
) {
  screen.ellipse(pos.x, pos.y, rx, ry, rotation, 0, Math.PI * 2);
}
