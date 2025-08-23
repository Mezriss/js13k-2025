import { acceleration, maxSpeed, rotationSpeed } from "./const";
import { controls } from "./controls";
import type { State } from "./game";
import { moveAndSlide } from "./util/collision";
import { normalizeAngle, relativeAngleDiff } from "./util/util";
import { Vector2 } from "./util/vector2";

export function updatePlayer(state: State, dt: number) {
  const multiplier =
    Math.max(state.ctx.canvas.width, state.ctx.canvas.height) / 100;

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
      maxSpeed * multiplier * dt,
      state.player.velocity.length + acceleration * multiplier * dt * dt,
    );

    state.player.velocity
      .copy(Vector2.fromAngle(newDirection))
      .normalize()
      .scale(speed);
  } else {
    const speed = Math.max(
      0,
      state.player.velocity.length - acceleration * multiplier * dt * dt,
    );
    state.player.velocity.normalize().scale(speed);
  }

  moveAndSlide(state.player.target, state.player.velocity, state.obstacles);

  state.player.target.copy(
    moveAndSlide(state.player.target, state.player.velocity, state.obstacles),
  );
  ensureBounds(state);

  state.player.body.update(state.player.target);
}

const ensureBounds = (state: State) => {
  const cx = state.ctx.canvas.width / 2;
  const cy = state.ctx.canvas.height / 2;

  if (state.player.target.x < -cx) state.player.target.x = -cx;
  if (state.player.target.y < -cy) state.player.target.y = -cy;
  if (state.player.target.x > cx) state.player.target.x = cx;
  if (state.player.target.y > cy) state.player.target.y = cy;
};
