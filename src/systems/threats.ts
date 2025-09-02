import { type AABB } from "../entities/polygon";
import type { State } from "../game";
import { getChainAABB } from "../util/chain";
import {
  checkAABBOverlap,
  checkCirclePolygonCollision,
} from "../util/collision";

export function updateThreats(state: State, dt: number) {
  let chainAABB: AABB | undefined;

  state.attacks.forEach((attack) => {
    attack.update(dt);
    if (attack.over) {
      if (!chainAABB) {
        chainAABB = getChainAABB(state.player.body.chain);
      }
      if (checkAABBOverlap(chainAABB, attack.collider.aabb)) {
        // todo collision check
        for (let i = 0; i < state.player.body.bodyLength; i++) {
          const segment = state.player.body.chain[i];
          const collided = checkCirclePolygonCollision(
            segment.joint,
            segment.radius,
            attack.collider,
          );
          if (collided) {
            state.player.hp -= 1;
            state.animations.hit = 1;
            break;
          }
        }
      }

      state.attacks.splice(state.attacks.indexOf(attack), 1);
    }
  });
}
