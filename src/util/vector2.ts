export class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2): Vector2 {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other: Vector2): Vector2 {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiplyScalar(scalar: number): Vector2 {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divideScalar(scalar: number): Vector2 {
    return this.multiplyScalar(1 / scalar);
  }

  get length(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(): Vector2 {
    return this.divideScalar(this.length || 1);
  }

  get angle(): number {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }

  rotateAround(center: Vector2, angle: number) {
    const c = Math.cos(angle),
      s = Math.sin(angle);

    const x = this.x - center.x;
    const y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  copy(other: Vector2): Vector2 {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  static fromAngle(angle: number): Vector2 {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }
}
