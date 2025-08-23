import { Namazu } from "./entities/namazu";
import { Vector2 } from "./util/vector2";
import { minFrameDuration } from "./const";
import { Polygon } from "./entities/polygon";
import { updatePlayer } from "./player";
import type { Attack } from "./entities/attack";
import { updateThreats } from "./threatManager";

export type State = {
  player: { body: Namazu; target: Vector2; velocity: Vector2; hp: number };
  obstacles: Polygon[];
  attacks: Attack[];
  ctx: CanvasRenderingContext2D;
};

let state: State;
let prevTime: number;

export const init = (canvas: HTMLCanvasElement) => {
  state = {
    player: {
      body: new Namazu(),
      target: new Vector2(0, -30),
      velocity: new Vector2(0, 0),
      hp: 3,
    },
    obstacles: [],
    attacks: [],
    ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
  };

  state.obstacles.push(
    new Polygon(
      new Vector2(100, 100),
      [
        new Vector2(0, 0),
        new Vector2(100, 0),
        new Vector2(100, 100),
        new Vector2(0, 100),
      ],
      Math.PI / 4,
    ),
  );

  prevTime = Number(document.timeline.currentTime);
  loop(prevTime);

  state.ctx.translate(state.ctx.canvas.width / 2, state.ctx.canvas.height / 2);
};

const loop: FrameRequestCallback = (time) => {
  const dt = Math.min((time - prevTime) / 1000, minFrameDuration);
  prevTime = time;
  update(dt);
  draw(state.ctx);
  requestAnimationFrame(loop);
};

const update = (dt: number) => {
  updatePlayer(state, dt);
  updateThreats(state, dt);
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(
    -state.ctx.canvas.width / 2,
    -state.ctx.canvas.height / 2,
    ctx.canvas.width,
    ctx.canvas.height,
  );

  state.obstacles.forEach((obstacle) => obstacle.debugDraw(ctx));
  state.attacks.forEach((attack) => attack.draw(ctx));

  state.player.body.draw(ctx);
};
