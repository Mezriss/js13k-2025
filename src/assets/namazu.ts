import { resolveChain, type Chain } from "../util/chain";
import { drawEllipse, drawSpline } from "../util/draw";
import { normalizeAngle, relativeAngleDiff } from "../util/util";
import { Vector2 } from "../util/vector2";

const segmentCount = 12;
const bodyLength = 10;
const segmentLength = 45;
const segmentWidth = [49, 56, 58, 58, 53, 44, 35, 26, 22, 13, 13, 13];
const maxAngle = Math.PI / 8;

export class Namazu {
  chain: Chain;
  scale = 0.5;

  constructor() {
    const that = this;
    this.chain = Array.from({ length: segmentCount }, (_e, i) => ({
      joint: new Vector2(0, segmentLength * i),
      angle: 0,
      get width(): number {
        return segmentWidth[i] * that.scale;
      },
    }));
  }

  update(target: Vector2) {
    resolveChain(target, this.chain, segmentLength * this.scale, maxAngle);
  }

  draw(ctx: CanvasRenderingContext2D) {
    //TODO: striped gradient for fins

    const maxBodyCurve = maxAngle * (segmentCount - 1);
    let bodyCurve = 0;
    for (let i = 1; i < this.chain.length; i++) {
      bodyCurve += relativeAngleDiff(
        this.chain[i].angle,
        this.chain[i - 1].angle,
      );
    }

    ctx.strokeStyle = "#AAA";
    ctx.fillStyle = "#333";
    ctx.lineWidth = (this.scale * segmentLength) / 9;

    const pectoralFinL = getSurfacePoint(
      this.chain[2],
      Math.PI / 2,
      this.chain[2].width,
    );
    const pectoralFinR = getSurfacePoint(
      this.chain[2],
      -Math.PI / 2,
      this.chain[2].width,
    );
    ctx.beginPath();
    drawEllipse(
      ctx,
      pectoralFinL,
      this.chain[2].width * 0.6,
      this.chain[2].width * 0.3,
      this.chain[2].angle + Math.PI * 0.4,
    );
    drawEllipse(
      ctx,
      pectoralFinR,
      this.chain[2].width * 0.6,
      this.chain[2].width * 0.3,
      this.chain[2].angle - Math.PI * 0.4,
    );
    ctx.stroke();
    ctx.fill();

    const ventralFinL = getSurfacePoint(
      this.chain[7],
      Math.PI / 2,
      this.chain[7].width,
    );
    const bentralFinR = getSurfacePoint(
      this.chain[7],
      -Math.PI / 2,
      this.chain[7].width,
    );
    ctx.beginPath();
    drawEllipse(
      ctx,
      ventralFinL,
      this.chain[7].width * 0.6,
      this.chain[7].width * 0.3,
      this.chain[7].angle + Math.PI * 0.4,
    );
    drawEllipse(
      ctx,
      bentralFinR,
      this.chain[7].width * 0.6,
      this.chain[7].width * 0.3,
      this.chain[7].angle - Math.PI * 0.4,
    );
    ctx.stroke();
    ctx.fill();

    // caudal fin
    const caudalFinTop = this.chain.slice(-3);
    const caudalFinBottom = caudalFinTop.toReversed().map((point, i) => {
      const maxW = this.chain[this.chain.length - 1].width;
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

    const outline = [0.8, 1, 1.2].map((r) =>
      getSurfacePoint(this.chain[0], Math.PI * r, this.chain[0].width),
    );

    for (let i = 0; i < bodyLength; i++) {
      outline.push(
        getSurfacePoint(this.chain[i], -Math.PI / 2, this.chain[i].width),
      );
      outline.unshift(
        getSurfacePoint(this.chain[i], Math.PI / 2, this.chain[i].width),
      );
    }
    outline.push(
      getSurfacePoint(
        this.chain[bodyLength - 1],
        0,
        this.chain[bodyLength - 1].width,
      ),
    );
    outline.unshift(
      getSurfacePoint(
        this.chain[bodyLength - 1],
        0,
        this.chain[bodyLength - 1].width,
      ),
    );
    ctx.fillStyle = "#222";
    ctx.beginPath();
    drawSpline(ctx, outline);
    ctx.fill();
    ctx.stroke();

    const dorsalFin = [
      this.chain[3].joint,
      ...[4, 5].map((i) =>
        getSurfacePoint(
          this.chain[i],
          Math.PI / 2,
          (this.chain[i].width * 0.05 * bodyCurve) / maxBodyCurve,
        ),
      ),
      this.chain[6].joint,
    ];
    ctx.fillStyle = "#333";
    ctx.beginPath();
    drawSpline(ctx, dorsalFin);
    ctx.fill();
    ctx.beginPath();
    drawSpline(ctx, dorsalFin);
    ctx.stroke();

    [Math.PI, -Math.PI].map((direction) => {
      const eye = getSurfacePoint(
        this.chain[0],
        direction / 2,
        this.chain[0].width * 0.6,
      );
      ctx.fillStyle = "skyblue";
      ctx.strokeStyle = "#AAA";
      ctx.lineWidth = this.chain[0].width * 0.05;
      ctx.beginPath();
      drawEllipse(
        ctx,
        eye,
        this.chain[0].width * 0.2,
        this.chain[0].width * 0.25,
        this.chain[0].angle - direction * 0.2,
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.strokeStyle = "white";
      const eyeInner = getSurfacePoint(
        this.chain[0],
        direction / 2,
        this.chain[0].width * 0.63,
      );
      ctx.lineWidth = this.chain[0].width * 0.07;
      ctx.beginPath();
      drawEllipse(
        ctx,
        eyeInner,
        this.chain[0].width * 0.1,
        this.chain[0].width * 0.125,
        this.chain[0].angle - direction * 0.2,
      );
      ctx.fill();
      ctx.stroke();
    });
  }
}

const getSurfacePoint = (segment: Chain[number], angle = 0, offset = 0) => {
  return Vector2.fromAngle(normalizeAngle(segment.angle + angle))
    .multiplyScalar(offset)
    .add(segment.joint);
};
