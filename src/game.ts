import { Fish } from "./entities/fish";
import { Vector2 } from "./util/vector2";
import { minFrameDuration, screenShakeDuration, namazu } from "./const";
import { Polygon } from "./entities/polygon";
import { updatePlayer } from "./player";
import type { Attack } from "./entities/attack";
import { updateThreats } from "./systems/threats";
import type { Chain } from "./util/chain";

export type State = {
  player: { body: Fish; target: Vector2; velocity: Vector2; hp: number };
  obstacles: Polygon[];
  attacks: Attack[];
  animations: {
    screenShake: number;
  };
  npcs: {
    body: Chain;
    target: Vector2;
    velocity: Vector2;
    hp: number;
  }[];
  ctx: CanvasRenderingContext2D;
};

let state: State;
let prevTime: number;

export const init = (canvas: HTMLCanvasElement) => {
  state = {
    player: {
      body: new Fish(namazu),
      target: new Vector2(0, -30),
      velocity: new Vector2(0, 0),
      hp: 3,
    },
    obstacles: [],
    attacks: [],
    animations: {
      screenShake: 0,
    },
    npcs: [],
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

const updateAnimations = (state: State, dt: number) => {
  state.animations.screenShake = Math.max(
    0,
    state.animations.screenShake - dt / screenShakeDuration,
  );
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
  updateAnimations(state, dt);
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(
    -ctx.canvas.width / 2,
    -ctx.canvas.height / 2,
    ctx.canvas.width,
    ctx.canvas.height,
  );

  ctx.save();

  if (state.animations.screenShake > 0) {
    const shakeMagnitude = state.animations.screenShake * 10;
    const offsetX = (Math.random() * 2 - 1) * shakeMagnitude;
    const offsetY = (Math.random() * 2 - 1) * shakeMagnitude;
    ctx.translate(offsetX, offsetY);
  }

  state.obstacles.forEach((obstacle) => obstacle.debugDraw(ctx));
  state.attacks.forEach((attack) => attack.draw(ctx));
  state.player.body.draw(ctx);

  ctx.restore();
};
