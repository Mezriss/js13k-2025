import level0 from "../data/levels/level0";
import { Polygon } from "../entities/polygon";
import type { State } from "../game";
import { Vector2 } from "../util/vector2";
import {
  AttackScheduler,
  NPCScheduler,
  type AttackConfig,
  type NPCConfig,
} from "./scheduler";

const levels: Level[] = [level0];

type LevelGeometry = {
  type: "rock";
  position: [number, number];
  shape: [number, number][];
  rotation?: number;
};

export type Level = {
  name: string;
  attacks: (AttackConfig | AttackConfig[])[];
  npcs: (NPCConfig | NPCConfig[])[];
  obstacles: LevelGeometry[];
};

export const loadLevel = (state: State, n: number) => {
  const level = levels[n];
  level.obstacles
    .filter(({ type }) => type === "rock")
    .forEach((obstacle) => {
      state.obstacles.push(
        new Polygon(
          new Vector2(obstacle.position[0], obstacle.position[1]),
          obstacle.shape.map(([x, y]) => new Vector2(x, y)),
          obstacle.rotation ?? 0,
        ),
      );
    });

  return {
    attackScheduler: new AttackScheduler(level.attacks),
    npcScheduler: new NPCScheduler(level.npcs),
  };
};
