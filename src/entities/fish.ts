import { resolveChain, type Chain } from "../util/chain";
import { drawEllipse, drawSpline } from "../util/draw";
import { normalizeAngle, relativeAngleDiff } from "../util/util";
import { Vector2 } from "../util/vector2";

const maxAngle = Math.PI / 8;

type FishProps = {
  segmentLength: number;
  segmentRadius: number[];
  scale: number;
  bodyLength: number;
  palette: FishPalette;
};

type FishPalette = {
  outline: string;
  fins: string;
  body: string;
  eyeSclera: string;
  eyeIris: string;
  eyePupil: string;
};

export class Fish {
  chain: Chain;
  scale: number;
  bodyLength: number;
  segmentLength: number;
  segmentCount: number;
  palette: FishPalette;

  constructor({
    segmentLength,
    segmentRadius,
    scale,
    bodyLength,
    palette,
  }: FishProps) {
    this.scale = scale;
    this.segmentLength = segmentLength;
    this.segmentCount = segmentRadius.length;
    this.bodyLength = bodyLength;
    this.palette = palette;

    this.chain = Array.from({ length: this.segmentCount }, (_e, i) => ({
      joint: new Vector2(0, segmentLength * i),
      angle: 0,
      get radius(): number {
        return segmentRadius[i] * scale;
      },
    }));
  }

  update(target: Vector2) {
    resolveChain(target, this.chain, this.segmentLength * this.scale, maxAngle);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const maxBodyCurve = maxAngle * (this.segmentCount - 1);
    let bodyCurve = 0;
    for (let i = 1; i < this.chain.length; i++) {
      bodyCurve += relativeAngleDiff(
        this.chain[i].angle,
        this.chain[i - 1].angle,
      );
    }

    ctx.strokeStyle = this.palette.outline;
    ctx.fillStyle = this.palette.fins;
    ctx.lineWidth = (this.scale * this.segmentLength) / 9;

    this._drawPectoralFins(ctx);
    this._drawVentralFins(ctx);
    this._drawCaudalFin(ctx, bodyCurve, maxBodyCurve);
    this._drawBodyOutline(ctx);
    this._drawDorsalFin(ctx, bodyCurve, maxBodyCurve);
    this._drawEyes(ctx);
  }

  private _drawPectoralFins(ctx: CanvasRenderingContext2D) {
    const pectoralFinL = getSurfacePoint(
      this.chain[2],
      Math.PI / 2,
      this.chain[2].radius,
    );
    const pectoralFinR = getSurfacePoint(
      this.chain[2],
      -Math.PI / 2,
      this.chain[2].radius,
    );
    ctx.beginPath();
    drawEllipse(
      ctx,
      pectoralFinL,
      this.chain[2].radius * 0.6,
      this.chain[2].radius * 0.3,
      this.chain[2].angle + Math.PI * 0.4,
    );
    drawEllipse(
      ctx,
      pectoralFinR,
      this.chain[2].radius * 0.6,
      this.chain[2].radius * 0.3,
      this.chain[2].angle - Math.PI * 0.4,
    );
    ctx.stroke();
    ctx.fill();
  }

  private _drawVentralFins(ctx: CanvasRenderingContext2D) {
    const ventralFinL = getSurfacePoint(
      this.chain[7],
      Math.PI / 2,
      this.chain[7].radius,
    );
    const bentralFinR = getSurfacePoint(
      this.chain[7],
      -Math.PI / 2,
      this.chain[7].radius,
    );
    ctx.beginPath();
    drawEllipse(
      ctx,
      ventralFinL,
      this.chain[7].radius * 0.6,
      this.chain[7].radius * 0.3,
      this.chain[7].angle + Math.PI * 0.4,
    );
    drawEllipse(
      ctx,
      bentralFinR,
      this.chain[7].radius * 0.6,
      this.chain[7].radius * 0.3,
      this.chain[7].angle - Math.PI * 0.4,
    );
    ctx.stroke();
    ctx.fill();
  }

  private _drawCaudalFin(
    ctx: CanvasRenderingContext2D,
    bodyCurve: number,
    maxBodyCurve: number,
  ) {
    const caudalFinTop = this.chain.slice(-3);
    const caudalFinBottom = caudalFinTop.toReversed().map((point, i) => {
      const maxW = this.chain[this.chain.length - 1].radius;
      return getSurfacePoint(
        point,
        Math.PI / 2,
        (maxW * (2.5 - i * 0.6) * bodyCurve) / maxBodyCurve,
      );
    });
    const caudalFin: Vector2[] = caudalFinTop
      .map((segment) => segment.joint)
      .concat(caudalFinBottom);
    ctx.beginPath();
    drawSpline(ctx, caudalFin);
    ctx.fill();
    ctx.beginPath();
    drawSpline(ctx, caudalFin);
    ctx.stroke();
  }

  private _drawBodyOutline(ctx: CanvasRenderingContext2D) {
    const outline = [0.8, 1, 1.2].map((r) =>
      getSurfacePoint(this.chain[0], Math.PI * r, this.chain[0].radius),
    );

    for (let i = 0; i < this.bodyLength; i++) {
      outline.push(
        getSurfacePoint(this.chain[i], -Math.PI / 2, this.chain[i].radius),
      );
      outline.unshift(
        getSurfacePoint(this.chain[i], Math.PI / 2, this.chain[i].radius),
      );
    }
    outline.push(
      getSurfacePoint(
        this.chain[this.bodyLength - 1],
        0,
        this.chain[this.bodyLength - 1].radius,
      ),
    );
    outline.unshift(
      getSurfacePoint(
        this.chain[this.bodyLength - 1],
        0,
        this.chain[this.bodyLength - 1].radius,
      ),
    );
    ctx.fillStyle = this.palette.body;
    ctx.beginPath();
    drawSpline(ctx, outline);
    ctx.fill();
    ctx.stroke();
  }

  private _drawDorsalFin(
    ctx: CanvasRenderingContext2D,
    bodyCurve: number,
    maxBodyCurve: number,
  ) {
    const dorsalFin = [
      this.chain[3].joint,
      ...[4, 5].map((i) =>
        getSurfacePoint(
          this.chain[i],
          Math.PI / 2,
          (this.chain[i].radius * 0.05 * bodyCurve) / maxBodyCurve,
        ),
      ),
      this.chain[6].joint,
    ];
    ctx.fillStyle = this.palette.fins;
    ctx.beginPath();
    drawSpline(ctx, dorsalFin);
    ctx.fill();
    ctx.beginPath();
    drawSpline(ctx, dorsalFin);
    ctx.stroke();
  }

  private _drawEyes(ctx: CanvasRenderingContext2D) {
    [Math.PI, -Math.PI].map((direction) => {
      const eye = getSurfacePoint(
        this.chain[0],
        direction / 2,
        this.chain[0].radius * 0.6,
      );
      ctx.fillStyle = this.palette.eyeSclera;
      ctx.strokeStyle = this.palette.eyeIris;
      ctx.lineWidth = this.chain[0].radius * 0.05;
      ctx.beginPath();
      drawEllipse(
        ctx,
        eye,
        this.chain[0].radius * 0.2,
        this.chain[0].radius * 0.25,
        this.chain[0].angle - direction * 0.2,
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.palette.eyePupil;
      ctx.strokeStyle = "white"; // Pupil highlight color
      const eyeInner = getSurfacePoint(
        this.chain[0],
        direction / 2,
        this.chain[0].radius * 0.63,
      );
      ctx.lineWidth = this.chain[0].radius * 0.07;
      ctx.beginPath();
      drawEllipse(
        ctx,
        eyeInner,
        this.chain[0].radius * 0.1,
        this.chain[0].radius * 0.125,
        this.chain[0].angle - direction * 0.2,
      );
      ctx.fill();
      ctx.stroke();
    });
  }
}

const getSurfacePoint = (segment: Chain[number], angle = 0, offset = 0) => {
  return Vector2.fromAngle(normalizeAngle(segment.angle + angle))
    .scale(offset)
    .add(segment.joint);
};
