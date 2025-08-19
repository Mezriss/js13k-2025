import type { AABB, Polygon } from "../assets/testObstacle";
import { Vector2 } from "./vector2";

type IntersectionResult = {
  intersectionPoint: Vector2;
  surfaceNormal: Vector2;
  t: number; // 0-1
};

function getLineSegmentIntersection(
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  p4: Vector2,
): { point: Vector2; t: number } | null {
  const d_x1 = p2.x - p1.x;
  const d_y1 = p2.y - p1.y;
  const d_x2 = p4.x - p3.x;
  const d_y2 = p4.y - p3.y;

  const denominator = d_y2 * d_x1 - d_x2 * d_y1;

  // Lines are parallel or collinear
  if (denominator === 0) {
    return null;
  }

  const t1 = ((p1.y - p3.y) * d_x2 - (p1.x - p3.x) * d_y2) / denominator;
  const t2 = ((p1.y - p3.y) * d_x1 - (p1.x - p3.x) * d_y1) / denominator;

  // Check if the intersection point is within both line segments
  if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
    return {
      point: new Vector2(p1.x + d_x1 * t1, p1.y + d_y1 * t1),
      t: t1, // How far along the first segment the intersection is
    };
  }

  return null;
}

function checkOverlap(a: AABB, b: AABB): boolean {
  if (a.min.x > b.max.x || b.min.x > a.max.x) {
    return false;
  }
  if (a.min.y > b.max.y || b.min.y > a.max.y) {
    return false;
  }
  return true;
}

function getMovementAABB(start: Vector2, end: Vector2): AABB {
  return {
    min: new Vector2(Math.min(start.x, end.x), Math.min(start.y, end.y)),
    max: new Vector2(Math.max(start.x, end.x), Math.max(start.y, end.y)),
  };
}

function findClosestCollision(
  startPos: Vector2,
  endPos: Vector2,
  polygons: Polygon[],
): IntersectionResult | null {
  let closestIntersection: IntersectionResult | null = null;

  const movementAABB = getMovementAABB(startPos, endPos);

  for (const polygon of polygons) {
    if (!checkOverlap(movementAABB, polygon.aabb)) {
      continue;
    }

    for (let i = 0; i < polygon.vertices.length; i++) {
      const p1 = polygon.vertices[i];
      const p2 = polygon.vertices[(i + 1) % polygon.vertices.length];

      const intersection = getLineSegmentIntersection(startPos, endPos, p1, p2);

      if (intersection) {
        if (!closestIntersection || intersection.t < closestIntersection.t) {
          const edgeVector = p2.clone().subtract(p1);
          // The normal is perpendicular to the edge vector
          // For a clockwise polygon, this gives an outward-facing normal
          closestIntersection = {
            intersectionPoint: intersection.point,
            surfaceNormal: new Vector2(edgeVector.y, -edgeVector.x).normalize(),
            t: intersection.t,
          };
        }
      }
    }
  }

  return closestIntersection;
}

function calculateSlideVector(velocity: Vector2, normal: Vector2): Vector2 {
  const dotProduct = velocity.clone().dot(normal);
  const projection = normal.clone().scale(dotProduct);
  return velocity.clone().subtract(projection);
}

export function moveAndSlide(
  startPos: Vector2,
  velocity: Vector2,
  polygons: Polygon[],
  maxBounces: number = 3,
): Vector2 {
  let currentPosition = startPos;
  let currentVelocity = velocity;
  let remainingTime = 1.0;
  const Epsilon = 0.0001; // To avoid floating point issues and getting stuck

  for (let i = 0; i < maxBounces; i++) {
    if (remainingTime <= 0) break;

    const intendedDestination = currentPosition
      .clone()
      .add(currentVelocity.clone().scale(remainingTime));

    const collision = findClosestCollision(
      currentPosition,
      intendedDestination,
      polygons,
    );

    if (!collision) {
      currentPosition = intendedDestination;
      break;
    }

    const movementToCollision = currentVelocity
      .clone()
      .scale(remainingTime * collision.t);
    currentPosition.add(movementToCollision);

    // Push the character slightly away from the wall along the normal
    // to prevent it from being detected as "inside" on the next frame.
    currentPosition.add(collision.surfaceNormal.clone().scale(Epsilon));

    remainingTime *= 1.0 - collision.t;

    currentVelocity = calculateSlideVector(
      currentVelocity,
      collision.surfaceNormal,
    );
  }

  return currentPosition;
}
