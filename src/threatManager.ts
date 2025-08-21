import { StoneAttack } from "./entities/attack";
import { Polygon } from "./entities/polygon";
import type { State } from "./game";
import { Vector2 } from "./util/vector2";

const testBoulder = [
  [-3, -1],
  [-1, -3],
  [2, -2],
  [3, 1],
  [1, 3],
  [-1, 3],
  [-3, 1],
  [-3, -1],
].map((p) => new Vector2(...(p as [number, number])));

export function updateThreats(state: State, dt: number) {
  while (state.attacks.length < 3) {
    state.attacks.push(
      new StoneAttack(
        new Polygon(
          new Vector2(Math.random() * 400 - 200, Math.random() * 400 - 200),
          testBoulder,
          0,
          10,
        ),
        1 + Math.random() * 0.5,
      ),
    );
  }

  state.attacks.forEach((attack) => {
    attack.update(dt);
    if (attack.over) {
      state.attacks.splice(state.attacks.indexOf(attack), 1);
    }
  });
}
