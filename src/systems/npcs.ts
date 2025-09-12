import { maxSpeed } from "../const";
import { Fish, type FishProps } from "../entities/fish";
import type { LevelState } from "../game";
import { testNPC } from "../testData";
import { moveAndSlide } from "../util/collision";
import { Vector2 } from "../util/vector2";

export type NPC = {
  body: FishProps;
  value: number;
  speed: number;
};

const npcs: { [key: string]: NPC } = {
  test: testNPC,
};

export function initNPC(
  variant: string,
  position: Vector2,
  path: Vector2[],
  cycle: boolean,
): LevelState["npcs"][number] {
  if (variant === "boat") {
    return {
      type: "boat",
      value: 1000,
      speed: 0.2,
      position,
      path,
      cycle,
    };
  }
  return {
    type: "fish",
    body: new Fish(npcs[variant].body),
    value: npcs[variant].value,
    speed: npcs[variant].speed,
    position,
    path,
    cycle,
  };
}

export function updateNpcs(state: LevelState, dt: number): void {
  for (const npc of state.npcs) {
    if (!npc.path.length) continue;
    const velocity = npc.path[0]
      .clone()
      .subtract(npc.position)
      .normalize()
      .scale(maxSpeed * npc.speed * dt);
    npc.position.copy(
      moveAndSlide(
        npc.position,
        velocity,
        state.obstacles.map((obstacle) => obstacle.collider),
      ),
    );
    if (npc.type === "fish") {
      npc.body.update(npc.position);
    }

    if (npc.position.clone().subtract(npc.path[0]).length < 10) {
      npc.path.push(npc.path.shift()!);
    }
  }
}
