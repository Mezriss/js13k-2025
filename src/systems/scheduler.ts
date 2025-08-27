import type { State } from "@/game";
import type { AttackConfig } from "./level";
import { Splitmix32 } from "@/util/util";
import { ch, cw } from "@/util/draw";
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
    const current = this.schedule.shift()!;
    this.current = Array.isArray(current) ? current : [current];
    this.rand = new Splitmix32(seed);
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
      const next = this.schedule.shift();
      if (next) {
        this.current = Array.isArray(next) ? next : [next];
      }
    }
  }
  applyAttack(state: State, attack: AttackConfig) {
    const amount = attack.amount ?? 1;

    const rotation = Array.from({ length: amount }, (_, i) => {
      let r: number | "random" = 0;
      if (attack.rotation) {
        r = Array.isArray(attack.rotation)
          ? attack.rotation[i]
          : attack.rotation;
      }
      return r === "random" ? this.rand.float() : r + Math.PI;
    });
    let position: Vector2 | "random";
    if (attack.position === "random") {
      position = "random";
    } else if (attack.position === "player") {
      position = state.player.position.clone();
    } else {
      position = new Vector2(cw(attack.position[0]), ch(attack.position[1]));
    }

    for (let i = 0; i < amount; i += 1) {
      if (attack.type === "rock") {
        state.attacks.push(
          new StoneAttack(
            new Polygon(
              position === "random"
                ? new Vector2(
                    this.rand.float(-50, 50),
                    this.rand.float(-50, 50),
                  )
                : position,
              testBoulder,
              rotation[i],
              10,
            ),
            1 + Math.random() * 0.5,
          ),
        );
      }

      if (attack.type === "spear") {
        state.attacks.push(
          new SpearAttack(
            new Polygon(
              position === "random"
                ? new Vector2(
                    this.rand.float(-50, 50),
                    this.rand.float(-50, 50),
                  )
                : position,
              testRectangle,
              rotation[i],
              10,
            ),
            1 + Math.random() * 0.5,
          ),
        );
      }
    }
  }
}
