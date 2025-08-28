import type { State } from "@/game";
import type { AttackConfig, Position } from "./level";
import { Splitmix32 } from "@/util/util";
import { ch, cmin, cw } from "@/util/draw";
import { Vector2 } from "@/util/vector2";
import { SpearAttack, StoneAttack } from "@/entities/attack";
import { testBoulder, testRectangle } from "@/testData";
import { Polygon } from "@/entities/polygon";

export class AttackScheduler {
  t = 0;
  rand: Splitmix32;
  schedule: (AttackConfig | AttackConfig[])[] = [];
  current: AttackConfig[] | undefined;
  constructor(schedule: (AttackConfig | AttackConfig[])[], seed = 1) {
    this.schedule = schedule.slice();
    this.rand = new Splitmix32(seed);
    this.setCurrent();
  }

  update(state: State, dt: number) {
    if (!this.current) return;
    this.t += dt;
    for (let i = this.current.length - 1; i >= 0; i--) {
      const attack = this.current[i];
      if (attack.t <= this.t) {
        this.applyAttack(state, attack);
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

    const attacks = Array.isArray(next) ? next : [next];
    this.current = [];

    // Process each attack, expanding staggered attacks
    for (const attack of attacks) {
      const amount = attack.amount ?? 1;

      if (attack.stagger && amount > 1) {
        for (let i = 0; i < amount; i++) {
          this.current.push({
            ...attack,
            amount: 1,
            t: attack.t + i * attack.stagger,
            rotation: Array.isArray(attack.rotation)
              ? attack.rotation[i]
              : attack.rotation,
            position:
              Array.isArray(attack.position) &&
              typeof attack.position[0] !== "number"
                ? (attack.position[i] as Position)
                : attack.position,
          });
        }
      } else {
        // Single attack or no stagger
        this.current.push(attack);
      }
    }
  }

  applyAttack(state: State, attack: AttackConfig) {
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
            cw(this.rand.float(-50, 50)),
            ch(this.rand.float(-50, 50)),
          );
        } else if (pos === "player") {
          return state.player.position.clone();
        } else {
          return new Vector2(cw(pos[0]), ch(pos[1]));
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
        pos.x += cw(this.rand.float(-attack.scatter, attack.scatter));
        pos.y += ch(this.rand.float(-attack.scatter, attack.scatter));
      }

      return pos;
    });

    // Create attacks
    for (let i = 0; i < amount; i++) {
      const pos = positions[i];
      const rot = rotations[i];

      if (attack.type === "rock") {
        state.attacks.push(
          new StoneAttack(
            new Polygon(pos, testBoulder, rot, cmin(1.8)),
            1 + this.rand.float() * 0.5,
          ),
        );
      } else if (attack.type === "spear") {
        state.attacks.push(
          new SpearAttack(
            new Polygon(pos, testRectangle(), rot),
            1 + this.rand.float() * 0.5,
          ),
        );
      }
    }
  }
}
