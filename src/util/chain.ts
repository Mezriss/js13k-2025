import type { AABB } from "../entities/polygon";
import { clamp, normalizeAngle, relativeAngleDiff } from "./util";
import { Vector2 } from "./vector2";

export type Chain = {
  joint: Vector2;
  angle: number;
  radius: number;
}[];

export const resolveChain = (
  position: Vector2,
  chain: Chain,
  segmentLength: number,
  maxAngle: number,
) => {
  chain[0].joint
    .subtract(position)
    .normalize()
    .scale(segmentLength)
    .add(position);
  chain[0].angle = chain[0].joint.clone().subtract(position).angle;

  for (let i = 1; i < chain.length; i += 1) {
    const prevJoint = chain[i - 1].joint;
    const curJoint = chain[i].joint;

    const curAngle = curJoint.clone().subtract(prevJoint).angle;
    const prevAngle = chain[i - 1].angle;

    chain[i].angle = constrainAngle(curAngle, prevAngle, maxAngle);

    const offset = Vector2.fromAngle(chain[i].angle).scale(segmentLength);
    curJoint.copy(offset).add(prevJoint);
  }
};

const constrainAngle = (angle: number, anchor: number, constraint: number) => {
  return normalizeAngle(
    anchor - clamp(relativeAngleDiff(angle, anchor), -constraint, constraint),
  );
};

export const getChainAABB = (chain: Chain) => {
  const aabb: AABB = {
    min: new Vector2(Infinity, Infinity),
    max: new Vector2(-Infinity, -Infinity),
  };

  for (const segment of chain) {
    const { joint, radius } = segment;

    aabb.min.x = Math.min(aabb.min.x, joint.x - radius);
    aabb.min.y = Math.min(aabb.min.y, joint.y - radius);
    aabb.max.x = Math.max(aabb.max.x, joint.x + radius);
    aabb.max.y = Math.max(aabb.max.y, joint.y + radius);
  }

  return aabb;
};
