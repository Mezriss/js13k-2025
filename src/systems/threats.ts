import { SpearAttack, StoneAttack } from "../entities/attack";
import { Polygon, type AABB } from "../entities/polygon";
import type { State } from "../game";
import { getChainAABB } from "../util/chain";
import {
  checkAABBOverlap,
  checkCirclePolygonCollision,
} from "../util/collision";
import { Vector2 } from "../util/vector2";

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

const testRectangle = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
].map((p) =>
  new Vector2(...(p as [number, number])).multiply(new Vector2(1000, 30)),
);

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
    state.attacks.push(
      new SpearAttack(
        new Polygon(
          new Vector2(Math.random() * 400 - 200, -200),
          testRectangle,
          1 + Math.random() * 0.5,
        ),
        1 + Math.random() * 0.5,
      ),
    );
  }

  let chainAABB: AABB | undefined;

  state.attacks.forEach((attack) => {
    attack.update(dt);
    if (attack.over) {
      if (!chainAABB) {
        chainAABB = getChainAABB(state.player.body.chain);
      }
      if (checkAABBOverlap(chainAABB, attack.shape.aabb)) {
        // todo collision check
        for (let i = 0; i < state.player.body.bodyLength; i++) {
          const segment = state.player.body.chain[i];
          const collided = checkCirclePolygonCollision(
            segment.joint,
            segment.radius,
            attack.shape,
          );
          if (collided) {
            state.player.hp -= 1;
            state.animations.screenShake = 1;
            console.info("hit");
            break;
          }
        }
      }

      state.attacks.splice(state.attacks.indexOf(attack), 1);
    }
  });
}
