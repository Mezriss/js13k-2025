import { Fish } from "./entities/fish";
import { Vector2 } from "./util/vector2";
import { minFrameDuration, animationDuration, namazu } from "./const";
import { Polygon } from "./entities/polygon";
import { updatePlayer } from "./systems/player";
import type { Attack } from "./entities/attack";
import { updateThreats } from "./systems/threats";
import { loadLevel } from "./systems/level";
import { updateNpcs } from "./systems/npcs";
import { UI } from "./entities/ui";
import { easing } from "./util/util";
import type { Vfx } from "./entities/vfx";
import { updateUnits } from "./util/draw";
import type { AttackScheduler, NPCScheduler } from "./systems/scheduler";

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
    thrash: number;
  };
  npcs: {
    body: Fish;
    position: Vector2;
    path: Vector2[];
    cycle: boolean;
    value: number;
    speed: number;
  }[];
  vfx: Vfx[];
  ctx: CanvasRenderingContext2D;
};

let state: State;
let ui: UI;
let prevTime: number;
let attackScheduler: AttackScheduler;
let npcScheduler: NPCScheduler;

export const init = (canvas: HTMLCanvasElement) => {
  state = {
    player: {
      body: new Fish(namazu),
      position: new Vector2(0, -30),
      velocity: new Vector2(0, 0),
      hp: 3,
      energy: 50,
      score: 0,
    },
    obstacles: [],
    attacks: [],
    animations: {
      hit: 0,
      catch: 0,
      thrash: 0,
    },
    npcs: [],
    vfx: [],
    ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
  };

  updateUnits();

  updateAnimations(state, 0);

  ui = new UI(state);

  ({ attackScheduler, npcScheduler } = loadLevel(state, 0));

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

const updateVfx = (state: State, dt: number) => {
  for (let i = state.vfx.length - 1; i >= 0; i--) {
    const sfx = state.vfx[i];
    sfx.update(dt);
    if (sfx.progress >= 1) {
      state.vfx.splice(i, 1);
    }
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
  attackScheduler.update(state, dt);
  npcScheduler.update(state, dt);
  updateNpcs(state, dt);
  updatePlayer(state, dt);
  updateThreats(state, dt);
  updateAnimations(state, dt);
  updateVfx(state, dt);
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

  state.vfx.forEach((sfx) => sfx.draw(ctx)); // TODO sfx layers
  state.obstacles.forEach((obstacle) => {
    ctx.fillStyle = "#666";
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 3;
    ctx.beginPath();
    obstacle.drawShape(ctx);
    ctx.fill();
    ctx.stroke();
  });
  state.attacks.forEach((attack) => attack.draw(ctx));
  state.npcs.forEach((npc) => npc.body.draw(ctx));

  const easedCatch = easing.parabolic(state.animations.catch);
  const easedThrash = easing.parabolic(state.animations.thrash);
  const scale = 1 + Math.max(easedCatch * 0.1, easedThrash * 0.2);

  ctx.save();
  ctx.translate(state.player.position.x, state.player.position.y);
  ctx.scale(scale, scale);
  ctx.translate(-state.player.position.x, -state.player.position.y);

  state.player.body.draw(ctx);

  ctx.restore();

  ui.draw(ctx);

  ctx.restore();
};
