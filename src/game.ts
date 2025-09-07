import { Fish } from "./entities/fish";
import { Vector2 } from "./util/vector2";
import { screen } from "./util/draw";
import { animationDuration, namazu } from "./const";
import { updatePlayer } from "./systems/player";
import type { StoneAttack } from "./entities/attack";
import { updateThreats } from "./systems/threats";
import { loadLevel } from "./systems/level";
import { updateNpcs } from "./systems/npcs";
import { UI } from "./entities/ui";
import { easing } from "./util/util";
import type { Vfx } from "./entities/vfx";
import type { AttackScheduler, NPCScheduler } from "./systems/scheduler";
import noise from "./util/noise";
import type { Reef } from "./entities/reef";
import { Temple } from "./entities/temple";

export type State = {
  t: number;
  player: {
    body: Fish;
    position: Vector2;
    velocity: Vector2;
    hp: number;
    energy: number;
    score: number;
  };
  obstacles: (Reef | Temple)[];
  attacks: StoneAttack[];
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
};

export class GameInstance {
  state: State;
  ui: UI;
  attackScheduler: AttackScheduler;
  npcScheduler: NPCScheduler;

  constructor(level: number) {
    this.state = {
      t: 0,
      player: {
        body: new Fish(namazu),
        position: new Vector2(0, -5),
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
    };

    updateAnimations(this.state, 0);

    this.ui = new UI(this.state);

    const { attackScheduler, npcScheduler } = loadLevel(this.state, level);

    this.attackScheduler = attackScheduler;
    this.npcScheduler = npcScheduler;
  }
  update(dt: number) {
    this.state.t += dt;
    this.attackScheduler.update(this.state, dt);
    this.npcScheduler.update(this.state, dt);
    updateNpcs(this.state, dt);
    updatePlayer(this.state, dt);
    updateThreats(this.state, dt);
    this.state.obstacles.forEach((obstacle) => obstacle.update(dt));
    updateAnimations(this.state, dt);
    updateVfx(this.state, dt);
    this.ui.update(this.state, dt);
  }
  draw() {
    screen.ctx.save();
    screen.center();

    screen.clear();

    applyScreenShake(this.state);

    this.state.vfx.forEach((sfx) => sfx.draw()); // TODO vfx layers

    this.state.obstacles.forEach((obstacle) => {
      obstacle.draw();
    });
    this.state.attacks.forEach((attack) => attack.drawHint());
    this.state.npcs.forEach((npc) => npc.body.draw());

    drawPlayer(this.state);

    this.state.obstacles.forEach((obstacle) => {
      if (obstacle instanceof Temple) obstacle.drawForeground?.();
    });

    this.state.attacks.forEach((attack) => attack.draw());

    postprocessing();

    this.ui.draw();

    // for initial translate
    screen.ctx.restore();
  }
}

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

const postprocessing = () => {
  // paper-like texture
  screen.ctx.save();
  screen.ctx.fillStyle = noise;
  screen.ctx.globalCompositeOperation = "multiply";
  screen.ctx.globalAlpha = 0.1;
  screen.ctx.fillRect(...screen.bounds);
  screen.ctx.restore();
};

const applyScreenShake = (state: State) => {
  if (state.animations.hit > 0) {
    const shakeMagnitude = state.animations.hit * 10;
    const offsetX = (Math.random() * 2 - 1) * shakeMagnitude;
    const offsetY = (Math.random() * 2 - 1) * shakeMagnitude;
    screen.ctx.translate(offsetX, offsetY);
  }
};

const drawPlayer = (state: State) => {
  const easedCatch = easing.parabolic(state.animations.catch);
  const easedThrash = easing.parabolic(state.animations.thrash);
  const scale = 1 + Math.max(easedCatch * 0.1, easedThrash * 0.2);

  screen.ctx.save();
  screen.ctx.translate(state.player.position.x, state.player.position.y);
  screen.ctx.scale(scale, scale);
  screen.ctx.translate(-state.player.position.x, -state.player.position.y);

  state.player.body.draw();
  screen.ctx.restore();
};
