import { Namazu } from "./assets/namazu";
import { Vector2 } from "./util/vector2";
import { controls } from "./controls";
import { acceleration, maxSpeed, velocityDecay } from "./const";

type State = {
  namazu: Namazu;
  target: Vector2;
  velocity: Vector2;
  ctx: CanvasRenderingContext2D;
};

let state: State;
let prevTime: number;

export const init = (canvas: HTMLCanvasElement) => {
  state = {
    namazu: new Namazu(),
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

  const velocityUpdate = new Vector2(
    Math.sign(controls.right - controls.left),
    Math.sign(controls.down - controls.up),
  )
    .normalize()
    .multiplyScalar(multiplier * maxSpeed * dt);
  state.velocity.copy(velocityUpdate);

  state.target.add(state.velocity);

  state.namazu.update(state.target);
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  state.namazu.draw(ctx);
};
