import type { State } from "@/game";
import { Splitmix32 } from "@/util/util";
import { Vector2 } from "@/util/vector2";
import { StoneAttack } from "@/entities/attack";

import { initNPC } from "./npcs";

type Position = "random" | "player" | [number, number];
type Rotation = number | "random";

export type AttackConfig = {
  t: number;
  stagger?: number;
  type: "spear" | "rock";
  position: Position | Position[];
  amount?: number;
  rotation?: Rotation | Rotation[];
  scatter?: number;
};

export type NPCConfig = {
  t: number;
  amount?: number;
  stagger?: number;
  position: [number, number];
  path: [number, number][];
  scatter?: number;
  cycle?: boolean;
  variant: string;
};

abstract class BaseScheduler<T> {
  t = 0;
  rand: Splitmix32;
  schedule: (T | T[])[] = [];
  current: T[] | undefined;

  constructor(schedule: (T | T[])[], seed = 1) {
    this.schedule = schedule.slice();
    this.rand = new Splitmix32(seed);
    this.setCurrent();
  }

  update(state: State, dt: number) {
    if (!this.current) return;
    this.t += dt;
    for (let i = this.current.length - 1; i >= 0; i--) {
      const config = this.current[i];
      if (this.getTime(config) <= this.t) {
        this.applyConfig(state, config);
        this.current.splice(i, 1);
      }
    }
    if (!this.current.length) {
      this.t = 0;
      this.setCurrent();
    }
  }

  setCurrent() {
    const next = this.schedule.shift();
    if (!next) {
      this.current = undefined;
      return;
    }

    const configs = Array.isArray(next) ? next : [next];
    this.current = [];

    // Process each config, expanding staggered configs
    for (const config of configs) {
      const amount = this.getAmount(config);
      const stagger = this.getStagger(config);

      if (stagger > 0 && amount > 1) {
        // Create individual configs with stagger timing
        for (let i = 0; i < amount; i++) {
          this.current.push({
            ...this.getStaggeredConfig(config, i),
            amount: 1,
            t: this.getTime(config) + i * stagger,
          } as T);
        }
      } else {
        // Single config or no stagger
        this.current.push(config);
      }
    }
  }

  abstract getTime(config: T): number;
  abstract getAmount(config: T): number;
  abstract getStagger(config: T): number;
  abstract getStaggeredConfig(config: T, i: number): T;
  abstract applyConfig(state: State, config: T): void;
}

export class AttackScheduler extends BaseScheduler<AttackConfig> {
  getTime(config: AttackConfig): number {
    return config.t;
  }

  getAmount(config: AttackConfig): number {
    return config.amount ?? 1;
  }

  getStagger(config: AttackConfig): number {
    return config.stagger ?? 0;
  }

  getStaggeredConfig(config: AttackConfig, i: number): AttackConfig {
    return {
      ...config,
      rotation: Array.isArray(config.rotation)
        ? config.rotation[i]
        : config.rotation,
      position:
        Array.isArray(config.position) && typeof config.position[0] !== "number"
          ? (config.position[i] as Position)
          : config.position,
    };
  }

  applyConfig(state: State, attack: AttackConfig) {
    const amount = attack.amount ?? 1;

    // Calculate rotation for each projectile
    const rotations = Array.from({ length: amount }, (_, i) => {
      let r: number | "random" = 0;
      if (attack.rotation !== undefined) {
        r = Array.isArray(attack.rotation)
          ? (attack.rotation[i] ?? 0)
          : attack.rotation;
      }
      const rotation = r === "random" ? this.rand.float() : r;
      return rotation * Math.PI;
    });

    // Calculate base positions for each projectile
    const positions = Array.from({ length: amount }, (_, i) => {
      let pos: Vector2;

      const getPosition = (pos: Position) => {
        if (pos === "random") {
          return new Vector2(
            this.rand.float(-50, 50),
            this.rand.float(-50, 50),
          );
        } else if (pos === "player") {
          return state.player.position.clone();
        } else {
          return new Vector2(pos[0], pos[1]);
        }
      };

      if (
        Array.isArray(attack.position) &&
        typeof attack.position[0] !== "number"
      ) {
        pos = getPosition((attack.position[i] as Position) ?? "random");
      } else {
        pos = getPosition((attack.position as Position) ?? "random");
      }

      // Apply scatter if specified
      if (attack.scatter !== undefined) {
        pos.x += this.rand.float(-attack.scatter, attack.scatter);
        pos.y += this.rand.float(-attack.scatter, attack.scatter);
      }

      return pos;
    });

    // Create attacks
    for (let i = 0; i < amount; i++) {
      const pos = positions[i];
      const rot = rotations[i];

      if (attack.type === "rock") {
        state.attacks.push(
          new StoneAttack(pos, rot, 1 + this.rand.float() * 0.5, 1),
        );
      } else if (attack.type === "spear") {
        // state.attacks.push(
        //   new SpearAttack(
        //     new Polygon(pos, testRectangle(), rot, 1.5),
        //     1 + this.rand.float() * 0.5,
        //   ),
        // );
      }
    }
  }
}

export class NPCScheduler extends BaseScheduler<NPCConfig> {
  getTime(config: NPCConfig): number {
    return config.t;
  }

  getAmount(config: NPCConfig): number {
    return config.amount ?? 1;
  }

  getStagger(config: NPCConfig): number {
    return config.stagger ?? 0;
  }

  getStaggeredConfig(config: NPCConfig): NPCConfig {
    return config;
  }

  applyConfig(state: State, npcConfig: NPCConfig) {
    const amount = npcConfig.amount ?? 1;

    const positions = new Vector2(npcConfig.position[0], npcConfig.position[1]);

    for (let i = 0; i < amount; i++) {
      const scatterOffset = npcConfig.scatter
        ? new Vector2(
            this.rand.float(-npcConfig.scatter, npcConfig.scatter),
            this.rand.float(-npcConfig.scatter, npcConfig.scatter),
          )
        : new Vector2(0, 0);

      const pos = positions.clone().add(scatterOffset);

      const scatteredPath = npcConfig.path.map(([x, y]) =>
        new Vector2(x, y).add(scatterOffset),
      );

      const npc = initNPC(
        npcConfig.variant,
        pos,
        scatteredPath,
        npcConfig.cycle ?? false,
      );
      npc.body.update(npc.position);
      state.npcs.push(npc);
    }
  }
}
