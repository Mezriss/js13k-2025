import { Reef } from "@/entities/reef";
import level0 from "../data/levels/level0";
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
  type: "reef";
  position: [number, number];
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
    .filter(({ type }) => type === "reef")
    .forEach((obstacle) => {
      state.obstacles.push(
        new Reef(new Vector2(obstacle.position[0], obstacle.position[1])),
      );
    });

  return {
    attackScheduler: new AttackScheduler(level.attacks),
    npcScheduler: new NPCScheduler(level.npcs),
  };
};
