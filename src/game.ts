import { Namazu } from "./assets/namazu";
import { Vector2 } from "./util/vector2";
import { controls } from "./controls";
import { acceleration, maxSpeed, rotationSpeed } from "./const";
import { normalizeAngle, relativeAngleDiff } from "./util/util";

type State = {
  player: Namazu;
  target: Vector2;
  velocity: Vector2;
  ctx: CanvasRenderingContext2D;
};

let state: State;
let prevTime: number;

export const init = (canvas: HTMLCanvasElement) => {
  state = {
    player: new Namazu(),
    target: new Vector2(0, -30),
    velocity: new Vector2(0, 0),
    ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
  };

  prevTime = Number(document.timeline.currentTime);
  loop(prevTime);
};

const loop: FrameRequestCallback = (time) => {
  const dt = (time - prevTime) / 1000;
  prevTime = time;
  update(dt);
  draw(state.ctx);
  requestAnimationFrame(loop);
};

const update = (dt: number) => {
  const multiplier =
    Math.max(state.ctx.canvas.width, state.ctx.canvas.height) / 100;

  const target = new Vector2(
    Math.sign(controls.right - controls.left),
    Math.sign(controls.down - controls.up),
  );

  if (target.length) {
    const currentDirection = normalizeAngle(
      state.player.chain[0].angle + Math.PI,
    );
    const diff = relativeAngleDiff(currentDirection, target.angle);
    const newDirection =
      currentDirection +
      Math.min(Math.abs(diff), Math.abs(dt * rotationSpeed)) * Math.sign(diff);

    const speed = Math.min(
      maxSpeed * multiplier * dt,
      state.velocity.length + acceleration * multiplier * dt * dt,
    );

    state.velocity
      .copy(Vector2.fromAngle(newDirection))
      .normalize()
      .multiplyScalar(speed);
  } else {
    const speed = Math.max(
      0,
      state.velocity.length - acceleration * multiplier * dt * dt,
    );
    state.velocity.normalize().multiplyScalar(speed);
  }

  state.target.add(state.velocity);
  ensureBounds(state.target);

  state.player.update(state.target);
};

const ensureBounds = (target: Vector2) => {
  const cx = state.ctx.canvas.width / 2;
  const cy = state.ctx.canvas.height / 2;

  if (target.x < -cx) target.x = -cx;
  if (target.y < -cy) target.y = -cy;
  if (target.x > cx) target.x = cx;
  if (target.y > cy) target.y = cy;
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  state.player.draw(ctx);
};
