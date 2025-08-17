import { clamp, normalizeAngle, relativeAngleDiff } from "./util";
import { Vector2 } from "./vector2";

export type Chain = {
  joint: Vector2;
  angle: number;
  width: number;
}[];

export const resolveChain = (
  target: Vector2,
  chain: Chain,
  segmentLength: number,
  maxAngle: number,
) => {
  chain[0].joint
    .subtract(target)
    .normalize()
    .multiplyScalar(segmentLength)
    .add(target);
  chain[0].angle = chain[0].joint.clone().subtract(target).angle;

  for (let i = 1; i < chain.length; i += 1) {
    const prevJoint = chain[i - 1].joint;
    const curJoint = chain[i].joint;

    const curAngle = curJoint.clone().subtract(prevJoint).angle;
    const prevAngle = chain[i - 1].angle;

    chain[i].angle = constrainAngle(curAngle, prevAngle, maxAngle);

    const offset = Vector2.fromAngle(chain[i].angle).multiplyScalar(
      segmentLength,
    );
    curJoint.copy(offset).add(prevJoint);
  }
};

const constrainAngle = (angle: number, anchor: number, constraint: number) => {
  return normalizeAngle(
    anchor - clamp(relativeAngleDiff(angle, anchor), -constraint, constraint),
  );
};
