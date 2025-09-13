import { SpearAttack } from "@/entities/attack";
import { maxSpeed } from "../const";
import { Fish, type FishProps } from "../entities/fish";
import type { LevelState } from "../game";
import { fishA, fishB } from "@/const";
import { moveAndSlide } from "../util/collision";
import { Vector2 } from "../util/vector2";

export type NPC = {
  body: FishProps;
  value: number;
  speed: number;
};

const npcs: { [key: string]: NPC } = {
  fishA: fishA,
  fishB: fishB,
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
      t: 0,
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
    } else {
      npc.t += dt;
      if (npc.t >= 3 && !state.outro.t) {
        npc.t = 0;
        launchAttack(npc.position, state);
      }
    }

    if (npc.position.clone().subtract(npc.path[0]).length < 10) {
      npc.path.push(npc.path.shift()!);
    }
  }

  // cleanup NPC that are out of bounds
  state.npcs = state.npcs.filter(({ position }) => {
    const { x, y } = position;
    return x > -120 && x < 120 && y > -70 && y < 70;
  });
}

function launchAttack(from: Vector2, state: LevelState) {
  const target = state.player.position
    .clone()
    .subtract(from)
    .normalize()
    .scale(5);
  const position = from.clone().add(target.scale(10)); //why is 10?
  state.attacks.push(new SpearAttack(position, target.angle, 1));
}
