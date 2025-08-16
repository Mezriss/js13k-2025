import { drawCircle, drawSpline } from "./util/draw";
import { clamp, normalizeAngle, relativeAngleDiff } from "./util/util";
import { Vector2 } from "./util/vector2";

type Chain = {
  joint: Vector2;
  angle: number;
  width: number;
}[];

const segmentCount = 6;
const segmentLength = 50;
const segmentWidth = [50, 50, 45, 40, 30, 20];
const maxAngle = Math.PI / 4;

export const init = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // chain init
  const chain: Chain = Array.from({ length: segmentCount }, (_e, i) => ({
    joint: new Vector2(0, segmentLength * i),
    angle: 0,
    width: segmentWidth[i],
  }));
  const target = new Vector2(0, 0);

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

  const resolveChain = (target: Vector2, chain: Chain) => {
    chain[0].joint
      .subtract(target)
      .normalize()
      .multiplyScalar(segmentLength)
      .add(target);
    chain[0].angle = chain[0].joint.clone().subtract(target).angle;

    for (let i = 1; i < chain.length; i += 1) {
      const prevJoint = chain[i - 1].joint;
      const curJoint = chain[i].joint;

      const curAngle = curJoint.clone().subtract(prevJoint).angle;
      const prevAngle = chain[i - 1].angle;

      chain[i].angle = constrainAngle(curAngle, prevAngle, maxAngle);

      const offset = Vector2.fromAngle(chain[i].angle).multiplyScalar(
        segmentLength,
      );
      curJoint.copy(offset).add(prevJoint);
    }
  };

  const constrainAngle = (
    angle: number,
    anchor: number,
    constraint: number,
  ) => {
    return normalizeAngle(
      anchor - clamp(relativeAngleDiff(angle, anchor), -constraint, constraint),
    );
  };

  const update = (_dt: number) => {
    resolveChain(target, chain);
  };

  const draw = (chain: Chain) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#888";
    ctx.fillStyle = "#222";
    ctx.lineWidth = 3;

    ctx.beginPath();

    drawSpline(
      ctx,
      chain.map((segment) => segment.joint),
    );
    ctx.stroke();

    const outline = [getSurfacePoint(chain[0], Math.PI)];

    for (let i = 0; i < chain.length; i++) {
      outline.push(getSurfacePoint(chain[i], -Math.PI / 2));
      outline.unshift(getSurfacePoint(chain[i], Math.PI / 2));
    }
    outline.push(getSurfacePoint(chain[chain.length - 1]));
    outline.unshift(getSurfacePoint(chain[chain.length - 1]));

    ctx.beginPath();
    drawSpline(ctx, outline);

    ctx.stroke();

    // for (let point of outline) {
    //   ctx.fillStyle = "blue";
    //   ctx.beginPath();
    //   drawCircle(ctx, point.x, point.y, 2);
    //   ctx.fill();
    // }

    const eye1 = getSurfacePoint(chain[0], Math.PI / 2, -20);
    const eye2 = getSurfacePoint(chain[0], -Math.PI / 2, -20);
    ctx.fillStyle = "red";
    ctx.beginPath();
    drawCircle(ctx, eye1.x, eye1.y, 3);
    drawCircle(ctx, eye2.x, eye2.y, 3);
    ctx.fill();
  };

  const getSurfacePoint = (segment: Chain[number], angle = 0, offset = 0) => {
    return Vector2.fromAngle(normalizeAngle(segment.angle + angle))
      .multiplyScalar(segment.width + offset)
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
