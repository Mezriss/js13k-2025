import { acceleration, maxSpeed, rotationSpeed, thrashingCost } from "../const";
import { controls } from "../controls";
import { Ripple } from "../entities/vfx";
import type { State } from "../game";
import { moveAndSlide } from "../util/collision";
import { cmax } from "../util/draw";
import { normalizeAngle, relativeAngleDiff } from "../util/util";
import { Vector2 } from "../util/vector2";

export function updatePlayer(state: State, dt: number) {
  handleControls(state, dt);
  catchFish(state);
}

function catchFish(state: State) {
  for (const npc of state.npcs) {
    for (let i = 0; i < npc.body.bodyLength; i++) {
      if (
        npc.body.chain[i].joint.clone().subtract(state.player.position).length <
        state.player.body.chain[0].radius / 2
      ) {
        state.player.energy += npc.value;
        //TODO: remove when proper scoring system is implemented
        state.player.score += 1000;
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

function thrash(state: State) {
  if (state.animations.thrash) {
    state.player.position.copy(
      moveAndSlide(
        state.player.position,
        thrashing.start
          .clone()
          .rotateAround(thrashing.pivot, Math.PI * 2 * state.animations.thrash)
          .subtract(state.player.position),
        state.obstacles,
      ),
    );
    ensureBounds(state);
    state.player.body.update(state.player.position);
    return;
  }

  if (state.player.energy < thrashingCost) return;
  state.player.energy -= thrashingCost;
  thrashing.start.copy(state.player.position);
  thrashing.pivot.copy(state.player.body.chain[0].joint);
  state.animations.thrash = 1;
  state.vfx.push(new Ripple(thrashing.pivot));
}

function handleControls(state: State, dt: number) {
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
      cmax(maxSpeed) * dt,
      state.player.velocity.length + cmax(acceleration) * dt * dt,
    );

    state.player.velocity
      .copy(Vector2.fromAngle(newDirection))
      .normalize()
      .scale(speed);
  } else {
    const speed = Math.max(
      0,
      state.player.velocity.length - cmax(acceleration) * dt * dt,
    );
    state.player.velocity.normalize().scale(speed);
  }

  state.player.position.copy(
    moveAndSlide(state.player.position, state.player.velocity, state.obstacles),
  );
  ensureBounds(state);

  state.player.body.update(state.player.position);
}

const ensureBounds = (state: State) => {
  const cx = state.ctx.canvas.width / 2;
  const cy = state.ctx.canvas.height / 2;

  if (state.player.position.x < -cx) state.player.position.x = -cx;
  if (state.player.position.y < -cy) state.player.position.y = -cy;
  if (state.player.position.x > cx) state.player.position.x = cx;
  if (state.player.position.y > cy) state.player.position.y = cy;
};
