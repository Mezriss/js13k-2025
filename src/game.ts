import { Fish } from "./entities/fish";
import { Vector2 } from "./util/vector2";
import { minFrameDuration, animationDuration, namazu } from "./const";
import { Polygon } from "./entities/polygon";
import { updatePlayer } from "./systems/player";
import type { Attack } from "./entities/attack";
import { updateThreats } from "./systems/threats";
import { loadLevel } from "./systems/level";
import { initNpcs, updateNpcs } from "./systems/npcs";
import { UI } from "./entities/ui";

export type State = {
  player: {
    body: Fish;
    position: Vector2;
    velocity: Vector2;
    hp: number;
    energy: number;
    score: number;
  };
  obstacles: Polygon[];
  attacks: Attack[];
  animations: {
    hit: number;
    catch: number;
  };
  npcs: {
    body: Fish;
    position: Vector2;
    path: Vector2[];
    value: number;
  }[];
  ctx: CanvasRenderingContext2D;
};

let state: State;
let ui: UI;
let prevTime: number;

export const init = (canvas: HTMLCanvasElement) => {
  state = {
    player: {
      body: new Fish(namazu),
      position: new Vector2(0, -30),
      velocity: new Vector2(0, 0),
      hp: 3,
      energy: 0,
      score: 0,
    },
    obstacles: [],
    attacks: [],
    animations: {
      hit: 0,
      catch: 0,
    },
    npcs: [],
    ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
  };

  ui = new UI(state);

  loadLevel(state);
  initNpcs(state);

  prevTime = Number(document.timeline.currentTime);
  loop(prevTime);

  state.ctx.translate(state.ctx.canvas.width / 2, state.ctx.canvas.height / 2);
};

const updateAnimations = (state: State, dt: number) => {
  for (const key in state.animations) {
    state.animations[key as keyof State["animations"]] = Math.max(
      0,
      state.animations[key as keyof State["animations"]] -
        dt / animationDuration[key as keyof typeof animationDuration],
    );
  }
};

const loop: FrameRequestCallback = (time) => {
  const dt = Math.min((time - prevTime) / 1000, minFrameDuration);
  prevTime = time;
  update(dt);
  draw(state.ctx);
  requestAnimationFrame(loop);
};

const update = (dt: number) => {
  updateNpcs(state, dt);
  updatePlayer(state, dt);
  updateThreats(state, dt);
  updateAnimations(state, dt);
  ui.update(state, dt);
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(
    -ctx.canvas.width / 2,
    -ctx.canvas.height / 2,
    ctx.canvas.width,
    ctx.canvas.height,
  );

  ctx.save();

  if (state.animations.hit > 0) {
    const shakeMagnitude = state.animations.hit * 10;
    const offsetX = (Math.random() * 2 - 1) * shakeMagnitude;
    const offsetY = (Math.random() * 2 - 1) * shakeMagnitude;
    ctx.translate(offsetX, offsetY);
  }

  state.obstacles.forEach((obstacle) => obstacle.debugDraw(ctx));
  state.attacks.forEach((attack) => attack.draw(ctx));
  state.npcs.forEach((npc) => npc.body.draw(ctx));

  const easedScaleFactor =
    4 * state.animations.catch * (1 - state.animations.catch);
  const catchScale = 1 + easedScaleFactor * 0.1;

  ctx.save();
  ctx.translate(state.player.position.x, state.player.position.y);
  ctx.scale(catchScale, catchScale);
  ctx.translate(-state.player.position.x, -state.player.position.y);

  state.player.body.draw(ctx);

  ctx.restore();

  ui.draw(ctx);

  ctx.restore();
};
