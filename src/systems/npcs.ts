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
    value: 1,
    position: new Vector2(-100, -100),
    path: [
      [-300, -300],
      [-300, 300],
      [250, 250],
      [300, -300],
    ].map(([x, y]) => new Vector2(x, y)),
  });
  for (const npc of state.npcs) {
    npc.body.update(npc.position);
  }
}

export function updateNpcs(state: State, dt: number): void {
  for (const npc of state.npcs) {
    if (!npc.path.length) continue;
    const velocity = npc.path[0]
      .clone()
      .subtract(npc.position)
      .normalize()
      .scale(cmax(maxSpeed * 0.8) * dt);
    npc.position.copy(moveAndSlide(npc.position, velocity, state.obstacles));
    npc.body.update(npc.position);

    if (npc.position.clone().subtract(npc.path[0]).length < 10) {
      npc.path.push(npc.path.shift()!);
    }
  }
}
