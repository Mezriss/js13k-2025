import { Namazu } from "./assets/namazu";
import { Vector2 } from "./util/vector2";

type State = {
  namazu: Namazu;
  target: Vector2;
  ctx: CanvasRenderingContext2D;
};

let state: State;
let prevTime: number;

export const init = (canvas: HTMLCanvasElement) => {
  state = {
    namazu: new Namazu(),
    target: new Vector2(0, -30),
    ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
  };

  canvas.addEventListener("pointerdown", updateTarget);
  canvas.addEventListener("pointermove", updateTarget);

  let prevTime = Number(document.timeline.currentTime);

  loop(prevTime);

  return () => {
    canvas.removeEventListener("pointerdown", updateTarget);
    canvas.removeEventListener("pointermove", updateTarget);
  };
};

const updateTarget = (event: PointerEvent) => {
  if (event.buttons === 1) {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    state.target.set(
      event.clientX - rect.left - rect.width / 2,
      event.clientY - rect.top - rect.height / 2,
    );
  }
};

const loop: FrameRequestCallback = (time) => {
  const dt = time - prevTime;
  prevTime = time;
  update(dt);
  draw(state.ctx);
  requestAnimationFrame(loop);
};

const update = (_dt: number) => {
  state.namazu.update(state.target);
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  state.namazu.draw(ctx);
};
