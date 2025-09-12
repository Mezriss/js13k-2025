import { resolveChain, type Chain } from "../util/chain";
import { drawEllipse, drawSpline } from "../util/draw";
import { normalizeAngle, relativeAngleDiff } from "../util/util";
import { Vector2 } from "@/util/vector2";
import { screen } from "@/util/draw";
import barbels from "@/assets/barbels";

const maxAngle = Math.PI / 8;

export type FishProps = {
  segmentLength: number;
  segmentRadius: number[];
  scale: number;
  bodyLength: number;
  palette: FishPalette;
  barbels?: boolean;
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
  barbels: boolean;

  constructor({
    segmentLength,
    segmentRadius,
    scale,
    bodyLength,
    palette,
    barbels = false,
  }: FishProps) {
    this.scale = scale;
    this.segmentLength = segmentLength;
    this.segmentCount = segmentRadius.length;
    this.bodyLength = bodyLength;
    this.palette = palette;
    this.barbels = barbels;

    this.chain = Array.from({ length: this.segmentCount }, (_e, i) => ({
      joint: new Vector2(0, segmentLength * i),
      angle: 0,
      get radius(): number {
        return segmentRadius[i] * scale;
      },
    }));
  }

  update(position: Vector2) {
    resolveChain(
      position,
      this.chain,
      this.segmentLength * this.scale,
      maxAngle,
    );
  }

  draw() {
    const maxBodyCurve = maxAngle * (this.segmentCount - 1);
    let bodyCurve = 0;
    for (let i = 1; i < this.chain.length; i++) {
      bodyCurve += relativeAngleDiff(
        this.chain[i].angle,
        this.chain[i - 1].angle,
      );
    }

    if (this.barbels) {
      this._drawBarbels();
    }

    screen.ctx.strokeStyle = this.palette.outline;
    screen.ctx.fillStyle = this.palette.fins;
    screen.ctx.lineWidth = screen.scale * 0.1;

    this._drawPectoralFins();
    this._drawVentralFins();
    this._drawCaudalFin(bodyCurve, maxBodyCurve);
    this._drawBodyOutline();
    this._drawDorsalFin(bodyCurve, maxBodyCurve);
    this._drawEyes();
  }

  private _drawBarbels() {
    barbels.draw(
      getSurfacePoint(this.chain[0], Math.PI, this.chain[0].radius / 2),
      new Vector2(1, 1).scale(0.05),
      this.chain[0].angle - Math.PI / 2,
      screen.scale * 0.2,
    );
  }

  private _drawPectoralFins() {
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
    screen.ctx.beginPath();
    drawEllipse(
      pectoralFinL,
      this.chain[2].radius * 0.6,
      this.chain[2].radius * 0.3,
      this.chain[2].angle + Math.PI * 0.4,
    );
    drawEllipse(
      pectoralFinR,
      this.chain[2].radius * 0.6,
      this.chain[2].radius * 0.3,
      this.chain[2].angle - Math.PI * 0.4,
    );
    screen.ctx.stroke();
    screen.ctx.fill();
  }

  private _drawVentralFins() {
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
    screen.ctx.beginPath();
    drawEllipse(
      ventralFinL,
      this.chain[7].radius * 0.6,
      this.chain[7].radius * 0.3,
      this.chain[7].angle + Math.PI * 0.4,
    );
    drawEllipse(
      bentralFinR,
      this.chain[7].radius * 0.6,
      this.chain[7].radius * 0.3,
      this.chain[7].angle - Math.PI * 0.4,
    );
    screen.ctx.stroke();
    screen.ctx.fill();
  }

  private _drawCaudalFin(bodyCurve: number, maxBodyCurve: number) {
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
    screen.ctx.beginPath();
    drawSpline(caudalFin);
    screen.ctx.fill();
    screen.ctx.beginPath();
    drawSpline(caudalFin);
    screen.ctx.stroke();
  }

  private _drawBodyOutline() {
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
    screen.ctx.fillStyle = this.palette.body;
    screen.ctx.beginPath();
    drawSpline(outline);
    screen.ctx.fill();
    screen.ctx.stroke();
  }

  private _drawDorsalFin(bodyCurve: number, maxBodyCurve: number) {
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
    screen.ctx.fillStyle = this.palette.fins;
    screen.ctx.beginPath();
    drawSpline(dorsalFin);
    screen.ctx.fill();
    screen.ctx.beginPath();
    drawSpline(dorsalFin);
    screen.ctx.stroke();
  }

  private _drawEyes() {
    [Math.PI, -Math.PI].map((direction) => {
      const eye = getSurfacePoint(
        this.chain[0],
        direction / 2,
        this.chain[0].radius * 0.6,
      );
      screen.ctx.fillStyle = this.palette.eyeSclera;
      screen.ctx.strokeStyle = this.palette.eyeIris;
      screen.ctx.lineWidth = this.chain[0].radius * 0.05;
      screen.ctx.beginPath();
      drawEllipse(
        eye,
        this.chain[0].radius * 0.2,
        this.chain[0].radius * 0.25,
        this.chain[0].angle - direction * 0.2,
      );
      screen.ctx.fill();
      screen.ctx.stroke();

      screen.ctx.fillStyle = this.palette.eyePupil;
      screen.ctx.strokeStyle = "white"; // Pupil highlight color
      const eyeInner = getSurfacePoint(
        this.chain[0],
        direction / 2,
        this.chain[0].radius * 0.63,
      );
      screen.ctx.lineWidth = this.chain[0].radius * 0.07;
      screen.ctx.beginPath();
      drawEllipse(
        eyeInner,
        this.chain[0].radius * 0.1,
        this.chain[0].radius * 0.125,
        this.chain[0].angle - direction * 0.2,
      );
      screen.ctx.fill();
      screen.ctx.stroke();
    });
  }
}

const getSurfacePoint = (segment: Chain[number], angle = 0, offset = 0) => {
  return Vector2.fromAngle(normalizeAngle(segment.angle + angle))
    .scale(offset)
    .add(segment.joint);
};
