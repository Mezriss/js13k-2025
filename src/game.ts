import { Fish } from "./entities/fish";
import { Vector2 } from "./util/vector2";
import { screen } from "./util/draw";
import { animationDuration, colors, lines, multipliers, namazu } from "./const";
import { updatePlayer } from "./systems/player";
import type { StoneAttack } from "./entities/attack";
import { updateThreats } from "./systems/threats";
import { loadLevel } from "./systems/level";
import { updateNpcs } from "./systems/npcs";
import { UI } from "./entities/ui";
import { easing } from "./util/util";
import type { Vfx } from "./entities/vfx";
import type { AttackScheduler, NPCScheduler } from "./systems/scheduler";
import { postprocessing } from "./util/noise";
import type { Reef } from "./entities/reef";
import { Temple } from "./entities/temple";
import type { Result } from "./main";
import { state } from "./state";
import { keyEvents } from "./util/keyboard";

export type LevelState = {
  t: number;
  player: {
    body: Fish;
    position: Vector2;
    velocity: Vector2;
    hp: number;
    energy: number;
    score: number;
    scoreMultiplier: number;
    scoreTimer: number;
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
  counters: {
    fish: number;
    bell: number;
    boat: number;
  };
  outro: { t: number; message: string[] };
};

export class GameInstance {
  state: LevelState;
  ui: UI;
  attackScheduler: AttackScheduler;
  npcScheduler: NPCScheduler;
  level: number;

  constructor(level: number) {
    this.state = {
      t: 0,
      player: {
        body: new Fish(namazu),
        position: new Vector2(0, -5),
        velocity: new Vector2(0, 0),
        hp: 3,
        energy: 0,
        score: 0,
        scoreMultiplier: 1,
        scoreTimer: 0,
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
      counters: {
        fish: 0,
        bell: 0,
        boat: 0,
      },
      outro: { t: 0, message: [] },
    };

    updateAnimations(this.state, 0);

    this.ui = new UI(this.state);

    this.level = level;
    const { attackScheduler, npcScheduler } = loadLevel(this.state, level);

    this.attackScheduler = attackScheduler;
    this.npcScheduler = npcScheduler;
  }
  update(dt: number): Result {
    this.state.t += dt;

    this.attackScheduler.update(this.state, dt);
    this.npcScheduler.update(this.state, dt);
    updateNpcs(this.state, dt);
    updatePlayer(this.state, dt);
    this.state.obstacles.forEach((obstacle) => obstacle.update(dt));
    updateAnimations(this.state, dt);
    updateVfx(this.state, dt);

    if (this.state.outro.t) {
      if (
        this.state.t - this.state.outro.t > 10 ||
        keyEvents.find((e) => e[0] === "action")
      ) {
        keyEvents.splice(0);
        if ((state.scores[this.level] ?? 0) < this.state.player.score) {
          state.scores[this.level] = this.state.player.score;
        }
        return "menu";
      }
      return;
    }

    updateThreats(this.state, dt);
    this.ui.update(this.state, dt);
    updateScore(this.state, dt);

    this.handleLevelEnd();
  }
  handleLevelEnd() {
    //conditions
    if (this.state.player.hp <= 0) {
      this.state.outro = { t: this.state.t, message: [lines.lose] };
    }
    if (
      !this.state.obstacles.some(
        (obstacle) => obstacle instanceof Temple && !obstacle.ringing,
      )
    ) {
      this.state.outro = { t: this.state.t, message: [lines.win] };
    }
    //actual handling
    if (this.state.outro.t) {
      keyEvents.splice(0);
      this.state.animations.hit = 0;

      const extra: string[] = [];
      (["bell", "fish", "boat"] as const).forEach((item) => {
        if (this.state.counters[item]) {
          extra.push(
            `${lines[item]} × ${this.state.counters[item]} - ${this.state.counters[item] * multipliers[item]}`,
          );
        }
      });

      this.state.outro.message.push(`Total Score: ${this.state.player.score}`);
      if (extra.length) {
        this.state.outro.message.push("Including bonus:", ...extra);
      }
    }
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

    if (this.state.outro.t) {
      this.drawScore();
    } else {
      this.ui.draw();
    }

    postprocessing();

    // for initial translate
    screen.ctx.restore();
  }
  drawScore() {
    screen.ctx.save();
    //TODO animated text reveal
    screen.ctx.fillStyle = colors.ui;
    screen.setFont(5);
    screen.fillText(this.state.outro.message[0], 0, 0);
    screen.setFont(3);
    for (let i = 1; i < this.state.outro.message.length; i++) {
      screen.fillText(this.state.outro.message[i], 0, i * 4 + 5);
    }
    screen.setFont(2);
    screen.fillText("[space]", 0, this.state.outro.message.length * 4 + 5);

    screen.ctx.restore();
  }
}

const updateScore = (state: LevelState, dt: number) => {
  state.player.scoreTimer += dt;
  if (state.player.scoreTimer >= 0.5) {
    state.player.score += state.player.scoreMultiplier;
    state.player.scoreMultiplier += 1;
    state.player.scoreTimer -= 0.5;
  }
};

const updateAnimations = (state: LevelState, dt: number) => {
  for (const key in state.animations) {
    state.animations[key as keyof LevelState["animations"]] = Math.max(
      0,
      state.animations[key as keyof LevelState["animations"]] -
        dt / animationDuration[key as keyof typeof animationDuration],
    );
  }
};

const updateVfx = (state: LevelState, dt: number) => {
  for (let i = state.vfx.length - 1; i >= 0; i--) {
    const sfx = state.vfx[i];
    sfx.update(dt);
    if (sfx.progress >= 1) {
      state.vfx.splice(i, 1);
    }
  }
};

const applyScreenShake = (state: LevelState) => {
  if (state.animations.hit > 0) {
    const shakeMagnitude = state.animations.hit * 10;
    const offsetX = (Math.random() * 2 - 1) * shakeMagnitude;
    const offsetY = (Math.random() * 2 - 1) * shakeMagnitude;
    screen.ctx.translate(offsetX, offsetY);
  }
};

const drawPlayer = (state: LevelState) => {
  const easedThrash = easing.parabolic(state.animations.thrash);
  const scale = 1 + easedThrash * 0.2;

  screen.ctx.save();
  screen.ctx.translate(state.player.position.x, state.player.position.y);
  screen.ctx.scale(scale, scale);
  screen.ctx.translate(-state.player.position.x, -state.player.position.y);

  state.player.body.draw();
  screen.ctx.restore();
};
