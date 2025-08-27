import { ch, cw } from "@/util/draw";
import level0 from "../data/levels/level0";
import { Polygon } from "../entities/polygon";
import type { State } from "../game";
import { Vector2 } from "../util/vector2";
import { AttackScheduler } from "./scheduler";

const levels: Level[] = [level0];

export type AttackConfig = {
  t: number;
  stagger?: number;
  type: "spear" | "rock";
  position: "random" | "player" | [number, number];
  amount?: number;
  rotation?: number | "random" | (number | "random")[];
  scatter?: number;
};

type LevelGeometry = {
  type: "rock";
  position: [number, number];
  shape: [number, number][];
  rotation?: number;
};

export type Level = {
  name: string;
  attacks: (AttackConfig | AttackConfig[])[];
  fish: [];
  obstacles: LevelGeometry[];
};

export const loadLevel = (state: State, n: number) => {
  const level = levels[n];
  level.obstacles
    .filter(({ type }) => type === "rock")
    .forEach((obstacle) => {
      state.obstacles.push(
        new Polygon(
          new Vector2(cw(obstacle.position[0]), ch(obstacle.position[1])),
          obstacle.shape.map(([x, y]) => new Vector2(cw(x), ch(y))),
          obstacle.rotation ?? 0,
        ),
      );
    });

  return {
    attackScheduler: new AttackScheduler(level.attacks),
  };
};
