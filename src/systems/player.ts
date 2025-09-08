import { Temple } from "@/entities/temple";
import {
  acceleration,
  maxSpeed,
  multipliers,
  rotationSpeed,
  thrashingCost,
  thrashingRadius,
} from "../const";
import { controls } from "../util/keyboard";
import { Ripple } from "../entities/vfx";
import type { LevelState } from "../game";
import { moveAndSlide } from "../util/collision";
import { normalizeAngle, relativeAngleDiff } from "../util/util";
import { Vector2 } from "../util/vector2";

export function updatePlayer(state: LevelState, dt: number) {
  handleControls(state, dt);
  catchFish(state);
}

function catchFish(state: LevelState) {
  for (const npc of state.npcs) {
    for (let i = 0; i < npc.body.bodyLength; i++) {
      if (
        npc.body.chain[i].joint.clone().subtract(state.player.position).length <
        state.player.body.chain[0].radius / 2
      ) {
        state.player.energy = Math.min(100, state.player.energy + npc.value);
        state.player.score += multipliers.fish;
        state.counters.fish += 1;
        state.animations.catch = 1;
        state.npcs.splice(state.npcs.indexOf(npc), 1);
        break;
      }
    }
  }
}

const thrashing = {
  start: new Vector2(),
  pivot: new Vector2(),
};

function thrash(state: LevelState) {
  if (state.animations.thrash) {
    state.player.position.copy(
      moveAndSlide(
        state.player.position,
        thrashing.start
          .clone()
          .rotateAround(thrashing.pivot, Math.PI * 2 * state.animations.thrash)
          .subtract(state.player.position),
        state.obstacles.map((obstacle) => obstacle.collider),
      ),
    );
    ensureBounds(state);
    state.player.body.update(state.player.position);
    return;
  }

  if (state.player.energy < thrashingCost) return;
  thrashing.start.copy(state.player.position);
  thrashing.pivot.copy(state.player.body.chain[1].joint);
  state.animations.thrash = 1;
  if (state.player.energy > 10) {
    ringBells(state);
    state.vfx.push(new Ripple(thrashing.pivot, true));
  } else {
    state.player.energy -= thrashingCost;
    state.vfx.push(new Ripple(thrashing.pivot));
  }
  // TODO hit boats
}

function handleControls(state: LevelState, dt: number) {
  if (controls.action || state.animations.thrash) {
    thrash(state);
  }
  if (state.animations.thrash) return;

  const target = new Vector2(
    Math.sign(controls.right - controls.left),
    Math.sign(controls.down - controls.up),
  );

  if (target.length) {
    const currentDirection = normalizeAngle(
      state.player.body.chain[0].angle + Math.PI,
    );
    const diff = relativeAngleDiff(currentDirection, target.angle);
    const newDirection =
      currentDirection +
      Math.min(Math.abs(diff), Math.abs(dt * rotationSpeed)) * Math.sign(diff);

    const speed = Math.min(
      maxSpeed * dt,
      state.player.velocity.length + acceleration * dt * dt,
    );

    state.player.velocity
      .copy(Vector2.fromAngle(newDirection))
      .normalize()
      .scale(speed);
  } else {
    const speed = Math.max(
      0,
      state.player.velocity.length - acceleration * dt * dt,
    );
    state.player.velocity.normalize().scale(speed);
  }

  state.player.position.copy(
    moveAndSlide(
      state.player.position,
      state.player.velocity,
      state.obstacles.map((obstacle) => obstacle.collider),
    ),
  );
  ensureBounds(state);

  state.player.body.update(state.player.position);
}

const ensureBounds = (state: LevelState) => {
  const cx = 80;
  const cy = 45;

  if (state.player.position.x < -cx) state.player.position.x = -cx;
  if (state.player.position.y < -cy) state.player.position.y = -cy;
  if (state.player.position.x > cx) state.player.position.x = cx;
  if (state.player.position.y > cy) state.player.position.y = cy;
};

function ringBells(state: LevelState) {
  const temples = state.obstacles.filter(
    (obstacle) => obstacle instanceof Temple,
  );
  temples.forEach((temple) => {
    if (
      temple.position.clone().subtract(thrashing.pivot).length < thrashingRadius
    ) {
      if (!temple.ringing) {
        state.player.score += multipliers.bell;
        state.counters.bell += 1;
        temple.ring();
      }
    }
  });
}
