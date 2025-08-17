import { resolveChain, type Chain } from "./util/chain";
import { drawCircle, drawEllipse, drawSpline } from "./util/draw";
import { normalizeAngle, relativeAngleDiff } from "./util/util";
import { Vector2 } from "./util/vector2";

const scale = 0.7;
const segmentCount = 12;
const bodyLength = 10;
const segmentLength = 64 * scale;
const segmentWidth = [68, 81, 84, 83, 77, 64, 51, 38, 32, 19, 19, 19].map(
  (width) => width * scale,
);
const maxAngle = Math.PI / 8;

export const init = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // chain init
  const chain: Chain = Array.from({ length: segmentCount }, (_e, i) => ({
    joint: new Vector2(0, segmentLength * i),
    angle: 0,
    width: segmentWidth[i],
  }));
  const target = new Vector2(0, -30);

  const updateTarget = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    target.set(
      event.clientX - rect.left - rect.width / 2,
      event.clientY - rect.top - rect.height / 2,
    );
  };

  canvas.addEventListener("pointerdown", updateTarget);
  canvas.addEventListener("pointermove", (event) => {
    if (event.buttons === 1) {
      updateTarget(event);
    }
  });

  const update = (_dt: number) => {
    resolveChain(target, chain, segmentLength, maxAngle);
  };

  //TODO: striped gradient for fins
  const draw = (chain: Chain) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxBodyCurve = maxAngle * (segmentCount - 1);
    let bodyCurve = 0;
    for (let i = 1; i < chain.length; i++) {
      bodyCurve += relativeAngleDiff(chain[i].angle, chain[i - 1].angle);
    }

    ctx.strokeStyle = "#AAA";
    ctx.fillStyle = "#333";
    ctx.lineWidth = 5;

    const pectoralFinL = getSurfacePoint(chain[2], Math.PI / 2, chain[2].width);
    const pectoralFinR = getSurfacePoint(
      chain[2],
      -Math.PI / 2,
      chain[2].width,
    );
    ctx.beginPath();
    drawEllipse(
      ctx,
      pectoralFinL,
      segmentWidth[2] * 0.6,
      segmentWidth[2] * 0.3,
      chain[2].angle + Math.PI * 0.4,
    );
    drawEllipse(
      ctx,
      pectoralFinR,
      segmentWidth[2] * 0.6,
      segmentWidth[2] * 0.3,
      chain[2].angle - Math.PI * 0.4,
    );
    ctx.stroke();
    ctx.fill();

    const ventralFinL = getSurfacePoint(chain[7], Math.PI / 2, chain[7].width);
    const bentralFinR = getSurfacePoint(chain[7], -Math.PI / 2, chain[7].width);
    ctx.beginPath();
    drawEllipse(
      ctx,
      ventralFinL,
      segmentWidth[7] * 0.6,
      segmentWidth[7] * 0.3,
      chain[7].angle + Math.PI * 0.4,
    );
    drawEllipse(
      ctx,
      bentralFinR,
      segmentWidth[7] * 0.6,
      segmentWidth[7] * 0.3,
      chain[7].angle - Math.PI * 0.4,
    );
    ctx.stroke();
    ctx.fill();

    const outline = [
      getSurfacePoint(chain[0], Math.PI * 0.8, chain[0].width),
      getSurfacePoint(chain[0], Math.PI, chain[0].width),
      getSurfacePoint(chain[0], Math.PI * 1.2, chain[0].width),
    ];

    for (let i = 0; i < bodyLength; i++) {
      outline.push(getSurfacePoint(chain[i], -Math.PI / 2, chain[i].width));
      outline.unshift(getSurfacePoint(chain[i], Math.PI / 2, chain[i].width));
    }
    outline.push(
      getSurfacePoint(chain[bodyLength - 1], 0, chain[bodyLength - 1].width),
    );
    outline.unshift(
      getSurfacePoint(chain[bodyLength - 1], 0, chain[bodyLength - 1].width),
    );

    // caudal fin
    const caudalFinTop = chain.slice(-3);
    const caudalFinBottom = caudalFinTop.toReversed().map((point, i) => {
      const maxW = segmentWidth[segmentWidth.length - 1];
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

    ctx.fillStyle = "#222";
    // body + outline
    ctx.beginPath();
    drawSpline(ctx, outline);
    ctx.fill();
    ctx.stroke();

    // fin?
    ctx.fillStyle = "#333";

    const dorsalFin = [
      chain[3].joint,
      ...[4, 5].map((i) =>
        getSurfacePoint(
          chain[i],
          Math.PI / 2,
          (segmentWidth[i] * 0.05 * bodyCurve) / maxBodyCurve,
        ),
      ),

      chain[6].joint,
    ];
    ctx.beginPath();
    drawSpline(ctx, dorsalFin);
    ctx.fill();
    ctx.beginPath();
    drawSpline(ctx, dorsalFin);
    ctx.stroke();

    [Math.PI, -Math.PI].map((direction) => {
      const eye = getSurfacePoint(
        chain[0],
        direction / 2,
        chain[0].width * 0.6,
      );
      ctx.fillStyle = "skyblue";
      ctx.strokeStyle = "#AAA";
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawEllipse(
        ctx,
        eye,
        chain[0].width * 0.2,
        chain[0].width * 0.25,
        chain[0].angle - direction * 0.2,
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.strokeStyle = "white";
      const eyeInner = getSurfacePoint(
        chain[0],
        direction / 2,
        chain[0].width * 0.63,
      );
      ctx.lineWidth = 3;
      ctx.beginPath();
      drawEllipse(
        ctx,
        eyeInner,
        chain[0].width * 0.1,
        chain[0].width * 0.125,
        chain[0].angle - direction * 0.2,
      );
      ctx.fill();
      ctx.stroke();
    });
  };

  const getSurfacePoint = (segment: Chain[number], angle = 0, offset = 0) => {
    return Vector2.fromAngle(normalizeAngle(segment.angle + angle))
      .multiplyScalar(offset)
      .add(segment.joint);
  };

  let prevTime = Number(document.timeline.currentTime);

  const loop: FrameRequestCallback = (time) => {
    const dt = time - prevTime;
    prevTime = time;
    update(dt);
    draw(chain);
    requestAnimationFrame(loop);
  };

  loop(prevTime);
};
