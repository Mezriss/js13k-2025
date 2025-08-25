import { maxSpeed } from "../const";
import { Fish } from "../entities/fish";
import type { State } from "../game";
import { testNPC } from "../testData";
import { moveAndSlide } from "../util/collision";
import { cmax } from "../util/draw";
import { Vector2 } from "../util/vector2";

export function initNpcs(state: State): void {
  state.npcs.push({
    body: new Fish(testNPC),
    target: new Vector2(-100, -100),
    path: [
      [-300, -300],
      [-300, 300],
      [250, 250],
      [300, -300],
    ].map(([x, y]) => new Vector2(x, y)),
  });
  for (const npc of state.npcs) {
    npc.body.update(npc.target);
  }
}

export function updateNpcs(state: State, dt: number): void {
  for (const npc of state.npcs) {
    if (!npc.path.length) continue;
    const velocity = npc.path[0]
      .clone()
      .subtract(npc.target)
      .normalize()
      .scale(cmax(maxSpeed) * dt);
    npc.target.copy(moveAndSlide(npc.target, velocity, state.obstacles));
    npc.body.update(npc.target);

    if (npc.target.clone().subtract(npc.path[0]).lengthSquared < 25) {
      npc.path.push(npc.path.shift()!);
    }
  }
}
