import type { AABB, Polygon } from "../entities/polygon";
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

function getMovementAABB(start: Vector2, end: Vector2): AABB {
  return {
    min: new Vector2(Math.min(start.x, end.x), Math.min(start.y, end.y)),
    max: new Vector2(Math.max(start.x, end.x), Math.max(start.y, end.y)),
  };
}

/**
 * Calculates the outward-facing normal for an edge, regardless of polygon winding
 */
function calculateOutwardNormal(
  edge: Vector2,
  polygon: Polygon,
  edgeIndex: number,
): Vector2 {
  // Calculate both possible normals
  const normal1 = new Vector2(edge.y, -edge.x).normalize();
  const normal2 = new Vector2(-edge.y, edge.x).normalize();

  // Get the midpoint of the current edge
  const p1 = polygon.vertices[edgeIndex];
  const p2 = polygon.vertices[(edgeIndex + 1) % polygon.vertices.length];
  const edgeMidpoint = p1.clone().add(p2).scale(0.5);

  // Test which normal points outward by checking if it points away from the polygon center
  const polygonCenter = polygon.vertices
    .reduce((sum, v) => sum.add(v), new Vector2(0, 0))
    .scale(1 / polygon.vertices.length);

  const toCenterVec = polygonCenter.clone().subtract(edgeMidpoint);

  // The outward normal should have a negative dot product with the vector to center
  if (normal1.dot(toCenterVec) < normal2.dot(toCenterVec)) {
    return normal1;
  }
  return normal2;
}

function findClosestCollision(
  startPos: Vector2,
  endPos: Vector2,
  polygons: Polygon[],
): IntersectionResult | null {
  let closestIntersection: IntersectionResult | null = null;

  const movementAABB = getMovementAABB(startPos, endPos);

  for (const polygon of polygons) {
    if (!checkAABBOverlap(movementAABB, polygon.aabb)) {
      continue;
    }

    for (let i = 0; i < polygon.vertices.length; i++) {
      const p1 = polygon.vertices[i];
      const p2 = polygon.vertices[(i + 1) % polygon.vertices.length];

      const intersection = getLineSegmentIntersection(startPos, endPos, p1, p2);

      if (intersection) {
        if (!closestIntersection || intersection.t < closestIntersection.t) {
          const edgeVector = p2.clone().subtract(p1);

          const outwardNormal = calculateOutwardNormal(edgeVector, polygon, i);

          closestIntersection = {
            intersectionPoint: intersection.point,
            surfaceNormal: outwardNormal,
            t: intersection.t,
          };
        }
      }
    }
  }

  return closestIntersection;
}

function calculateSlideVector(velocity: Vector2, normal: Vector2): Vector2 {
  const dotProduct = velocity.dot(normal);
  const projection = normal.clone().scale(dotProduct);
  return velocity.clone().subtract(projection);
}

export function moveAndSlide(
  startPos: Vector2,
  velocity: Vector2,
  polygons: Polygon[],
  maxBounces: number = 3,
): Vector2 {
  let currentPosition = startPos.clone();
  let currentVelocity = velocity.clone();
  let remainingTime = 1.0;
  const Epsilon = 0.0001; // To avoid floating point issues and getting stuck

  for (let i = 0; i < maxBounces; i++) {
    if (remainingTime <= Epsilon) break;

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
    currentPosition.add(collision.surfaceNormal.clone().scale(Epsilon));

    remainingTime *= 1.0 - collision.t;

    currentVelocity = calculateSlideVector(
      currentVelocity,
      collision.surfaceNormal,
    );

    if (currentVelocity.lengthSquared < Epsilon * Epsilon) {
      break;
    }
  }

  return currentPosition;
}

function getClosestPointOnSegment(
  point: Vector2,
  p1: Vector2,
  p2: Vector2,
): Vector2 {
  const edgeVector = p2.clone().subtract(p1);
  const pointVector = point.clone().subtract(p1);

  const edgeLengthSq = edgeVector.lengthSquared;
  if (edgeLengthSq === 0) {
    return p1.clone();
  }

  // Project pointVector onto edgeVector to find the 't' parameter
  const t = Math.max(
    0,
    Math.min(1, pointVector.dot(edgeVector) / edgeLengthSq),
  );

  // The closest point is p1 + t * edgeVector
  return p1.clone().add(edgeVector.scale(t));
}

function isPointInPolygon(point: Vector2, polygon: Polygon): boolean {
  const vertices = polygon.vertices;
  let windingNumber = 0;

  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % vertices.length];

    if (p1.y <= point.y) {
      if (p2.y > point.y) {
        // Upward crossing
        const cross =
          (p2.x - p1.x) * (point.y - p1.y) - (point.x - p1.x) * (p2.y - p1.y);
        if (cross > 0) windingNumber++;
      }
    } else {
      if (p2.y <= point.y) {
        // Downward crossing
        const cross =
          (p2.x - p1.x) * (point.y - p1.y) - (point.x - p1.x) * (p2.y - p1.y);
        if (cross < 0) windingNumber--;
      }
    }
  }

  return windingNumber !== 0;
}

export function checkCirclePolygonCollision(
  center: Vector2,
  radius: number,
  polygon: Polygon,
): boolean {
  const vertices = polygon.vertices;

  let minDistanceSq = Infinity;

  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % vertices.length];

    const closestPointOnSegment = getClosestPointOnSegment(center, p1, p2);
    const distanceSq = center
      .clone()
      .subtract(closestPointOnSegment).lengthSquared;

    if (distanceSq < minDistanceSq) {
      minDistanceSq = distanceSq;
    }
  }

  const distance = Math.sqrt(minDistanceSq);

  // extra check for a circle completely inside a polygon
  if (distance > radius) return isPointInPolygon(center, polygon);

  return true;
}

export function checkAABBOverlap(a: AABB, b: AABB): boolean {
  return !(
    a.min.x > b.max.x ||
    b.min.x > a.max.x ||
    a.min.y > b.max.y ||
    b.min.y > a.max.y
  );
}
